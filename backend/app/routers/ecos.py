from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.stage_machine import stage_machine
from app.models.eco import Eco, EcoStage, EcoLog
from app.models.bom import Bom, BomComponent, BomOperation
from app.models.user import User
from app.schemas.eco import EcoCreate, EcoUpdate, EcoOut

router = APIRouter(prefix="/api/ecos", tags=["ecos"])

_eng_admin = require_roles("Admin", "Engineering User")


@router.post("/", response_model=EcoOut, status_code=status.HTTP_201_CREATED)
async def create_eco(
    payload: EcoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_eng_admin),
):
    # Validate eco_type
    if payload.eco_type not in ("Product", "BoM"):
        raise HTTPException(status_code=422, detail="eco_type must be 'Product' or 'BoM'")
    if payload.eco_type == "BoM" and payload.target_bom_id is None:
        raise HTTPException(status_code=422, detail="target_bom_id is required when eco_type is 'BoM'")

    # Get first stage by sequence_order
    result = await db.execute(select(EcoStage).order_by(EcoStage.sequence_order))
    first_stage = result.scalars().first()
    if first_stage is None:
        raise HTTPException(status_code=409, detail="No ECO stages configured. Please configure stages in Settings first.")

    eco = Eco(
        title=payload.title,
        eco_type=payload.eco_type,
        target_product_id=payload.target_product_id,
        target_bom_id=payload.target_bom_id,
        current_stage_id=first_stage.stage_id,
        version_update_toggle=payload.version_update_toggle,
        effective_date=payload.effective_date.replace(tzinfo=None) if payload.effective_date else None,
        proposed_changes=payload.proposed_changes,
        status="Open",
        created_by=current_user.user_id,
    )

    # For BoM ECOs, snapshot the current BoM state as the "before" baseline
    if payload.eco_type == "BoM" and payload.target_bom_id:
        bom_result = await db.execute(
            select(Bom)
            .where(Bom.bom_id == payload.target_bom_id)
            .options(selectinload(Bom.components), selectinload(Bom.operations))
        )
        bom_snap = bom_result.scalar_one_or_none()
        if bom_snap:
            eco.proposed_changes = {
                "snapshot_components": [
                    {"component_id": c.component_id, "product_id": c.product_id,
                     "quantity": float(c.quantity), "unit_of_measure": c.unit_of_measure}
                    for c in bom_snap.components
                ],
                "snapshot_operations": [
                    {"operation_id": op.operation_id, "work_center": op.work_center,
                     "operation_time_mins": op.operation_time_mins, "sequence_order": op.sequence_order}
                    for op in bom_snap.operations
                ],
            }
    db.add(eco)
    await db.commit()
    await db.refresh(eco)
    return await _load_eco(eco.eco_id, db)


@router.get("/", response_model=list[EcoOut])
async def list_ecos(
    status_filter: Optional[str] = Query(None, alias="status"),
    product_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Eco).options(
        selectinload(Eco.current_stage),
        selectinload(Eco.target_product),
        selectinload(Eco.target_bom),
    )
    if status_filter:
        q = q.where(Eco.status == status_filter)
    if product_id:
        q = q.where(Eco.target_product_id == product_id)
    result = await db.execute(q)
    return [EcoOut.model_validate(e) for e in result.scalars().all()]


@router.get("/{eco_id}", response_model=EcoOut)
async def get_eco(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    eco = await _load_eco(eco_id, db)
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    return eco


@router.put("/{eco_id}", response_model=EcoOut)
async def update_eco(
    eco_id: int,
    payload: EcoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_eng_admin),
):
    result = await db.execute(select(Eco).where(Eco.eco_id == eco_id))
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    if eco.status in ("Applied", "Rejected"):
        raise HTTPException(status_code=409, detail="Cannot edit a terminal ECO")

    for field, value in payload.model_dump(exclude_none=True).items():
        if field == 'effective_date' and value is not None:
            value = value.replace(tzinfo=None)
        setattr(eco, field, value)
    await db.commit()
    return await _load_eco(eco_id, db)


async def _load_eco(eco_id: int, db: AsyncSession) -> Optional[EcoOut]:
    result = await db.execute(
        select(Eco).where(Eco.eco_id == eco_id).options(
            selectinload(Eco.current_stage),
            selectinload(Eco.target_product),
            selectinload(Eco.target_bom),
        )
    )
    eco = result.scalar_one_or_none()
    if eco is None:
        return None
    return EcoOut.model_validate(eco)


_approver_admin = require_roles("Admin", "Approver")
_any_auth = get_current_user


async def _get_all_stages(db: AsyncSession):
    result = await db.execute(select(EcoStage).order_by(EcoStage.sequence_order))
    return result.scalars().all()


async def _write_log(eco_id, stage_id, action_by, action_taken, old_val, new_val, db):
    log = EcoLog(
        eco_id=eco_id,
        stage_id=stage_id,
        action_by=action_by,
        action_taken=action_taken,
        old_value=old_val,
        new_value=new_val,
    )
    db.add(log)


@router.post("/{eco_id}/start", response_model=EcoOut)
async def start_eco(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_eng_admin),
):
    result = await db.execute(select(Eco).where(Eco.eco_id == eco_id))
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    if eco.is_started:
        raise HTTPException(status_code=409, detail="ECO already started")
    eco.is_started = True
    await db.commit()
    return await _load_eco(eco_id, db)


@router.post("/{eco_id}/approve", response_model=EcoOut)
async def approve_eco(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_approver_admin),
):
    result = await db.execute(
        select(Eco).where(Eco.eco_id == eco_id).options(selectinload(Eco.current_stage))
    )
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    if stage_machine.is_terminal(eco.status):
        raise HTTPException(status_code=409, detail="ECO is in a terminal state", headers={"X-Error-Code": "ECO_TERMINAL_STATE"})
    if not eco.current_stage or not eco.current_stage.requires_approval:
        raise HTTPException(status_code=400, detail="Current stage does not require approval. Use /validate instead.")

    stages = await _get_all_stages(db)
    old_stage_id = eco.current_stage_id
    next_stage = stage_machine.next_stage(eco.current_stage_id, stages)

    if next_stage is None or eco.current_stage.is_final_stage:
        eco.status = "Validated"
    else:
        eco.current_stage_id = next_stage.stage_id

    await _write_log(eco_id, old_stage_id, current_user.user_id, "Approved", {"stage_id": old_stage_id}, {"stage_id": eco.current_stage_id, "status": eco.status}, db)
    await db.commit()
    return await _load_eco(eco_id, db)


@router.post("/{eco_id}/validate", response_model=EcoOut)
async def validate_eco(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Eco).where(Eco.eco_id == eco_id).options(selectinload(Eco.current_stage))
    )
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    if stage_machine.is_terminal(eco.status):
        raise HTTPException(status_code=409, detail="ECO is in a terminal state", headers={"X-Error-Code": "ECO_TERMINAL_STATE"})
    if eco.current_stage and eco.current_stage.requires_approval:
        raise HTTPException(status_code=400, detail="Current stage requires approval. Use /approve instead.")

    stages = await _get_all_stages(db)
    old_stage_id = eco.current_stage_id
    next_stage = stage_machine.next_stage(eco.current_stage_id, stages)

    if next_stage is None or (eco.current_stage and eco.current_stage.is_final_stage):
        eco.status = "Validated"
    else:
        eco.current_stage_id = next_stage.stage_id
        # status stays Open while moving through stages

    await _write_log(eco_id, old_stage_id, current_user.user_id, "Validated", {"stage_id": old_stage_id}, {"stage_id": eco.current_stage_id, "status": eco.status}, db)
    await db.commit()
    return await _load_eco(eco_id, db)


@router.post("/{eco_id}/apply", response_model=EcoOut)
async def apply_eco(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_approver_admin),
):
    from app.core.version_manager import version_manager

    result = await db.execute(
        select(Eco).where(Eco.eco_id == eco_id).options(selectinload(Eco.current_stage))
    )
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    if eco.status != "Validated":
        raise HTTPException(
            status_code=409,
            detail="Only ECOs with status 'Validated' can be applied",
            headers={"X-Error-Code": "ECO_TERMINAL_STATE"},
        )

    old_status = eco.status
    await version_manager.apply_eco(eco, db)
    eco.status = "Applied"

    await _write_log(
        eco_id, eco.current_stage_id, current_user.user_id, "Applied",
        {"status": old_status}, {"status": "Applied"}, db
    )
    await db.commit()
    return await _load_eco(eco_id, db)


@router.post("/{eco_id}/reject", response_model=EcoOut)
async def reject_eco(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_approver_admin),
):
    result = await db.execute(
        select(Eco).where(Eco.eco_id == eco_id).options(selectinload(Eco.current_stage))
    )
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")
    if stage_machine.is_terminal(eco.status):
        raise HTTPException(
            status_code=409,
            detail="ECO is already in a terminal state",
            headers={"X-Error-Code": "ECO_TERMINAL_STATE"},
        )

    old_status = eco.status
    eco.status = "Rejected"
    await _write_log(
        eco_id, eco.current_stage_id, current_user.user_id, "Rejected",
        {"status": old_status}, {"status": "Rejected"}, db
    )
    await db.commit()
    return await _load_eco(eco_id, db)


@router.get("/{eco_id}/diff")
async def get_eco_diff(
    eco_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.core.diff_engine import compute_diff
    from app.models.product import ProductVersion

    result = await db.execute(select(Eco).where(Eco.eco_id == eco_id))
    eco = result.scalar_one_or_none()
    if eco is None:
        raise HTTPException(status_code=404, detail="ECO not found")

    # Fetch current active product version data
    current_data = {}
    if eco.target_product_id:
        pv_result = await db.execute(
            select(ProductVersion).where(
                ProductVersion.product_id == eco.target_product_id,
                ProductVersion.status == "Active",
                ProductVersion.is_latest == True,  # noqa: E712
            )
        )
        pv = pv_result.scalar_one_or_none()
        if pv:
            current_data = {
                "product_name": pv.product_name,
                "sale_price": float(pv.sale_price) if pv.sale_price is not None else None,
                "cost_price": float(pv.cost_price) if pv.cost_price is not None else None,
                "attachments_url": pv.attachments_url,
            }

    proposed = eco.proposed_changes or {}
    diff_fields = compute_diff(current_data, proposed)

    return [
        {
            "field": d.field,
            "old_value": d.old_value,
            "new_value": d.new_value,
            "change_type": d.change_type,
        }
        for d in diff_fields
    ]
