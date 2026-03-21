from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.deps import get_current_user
from app.models.bom import Bom, BomComponent, BomOperation
from app.models.product import Product, ProductVersion
from app.models.user import User
from app.schemas.bom import BomOut, BomCreate, BomComponentOut, BomComponentCreate, BomOperationOut, BomOperationCreate

router = APIRouter(prefix="/api/boms", tags=["boms"])


async def _bom_to_out(bom: Bom, db: AsyncSession) -> BomOut:
    """Convert a Bom ORM object to BomOut, resolving product_name."""
    product_name = None
    if bom.product_version_id:
        pv_result = await db.execute(
            select(ProductVersion).where(ProductVersion.version_id == bom.product_version_id)
        )
        pv = pv_result.scalar_one_or_none()
        if pv:
            product_name = pv.product_name
    data = BomOut.model_validate(bom)
    data.product_name = product_name
    return data


@router.get("/", response_model=list[BomOut])
async def list_boms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Bom).options(selectinload(Bom.components), selectinload(Bom.operations))
    )
    boms = result.scalars().all()
    return [await _bom_to_out(b, db) for b in boms]


@router.get("/by-product-version/{version_id}", response_model=list[BomOut])
async def list_boms_by_version(
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Bom)
        .where(Bom.product_version_id == version_id)
        .options(selectinload(Bom.components), selectinload(Bom.operations))
    )
    boms = result.scalars().all()
    return [await _bom_to_out(b, db) for b in boms]


@router.get("/{bom_id}", response_model=BomOut)
async def get_bom(
    bom_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Bom)
        .where(Bom.bom_id == bom_id)
        .options(selectinload(Bom.components), selectinload(Bom.operations))
    )
    bom = result.scalar_one_or_none()
    if bom is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BoM not found")
    return await _bom_to_out(bom, db)


@router.post("/", response_model=BomOut, status_code=status.HTTP_201_CREATED)
async def create_bom(
    payload: BomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Guard: only Active product versions can have new BoMs
    result = await db.execute(
        select(ProductVersion).where(ProductVersion.version_id == payload.product_version_id)
    )
    pv = result.scalar_one_or_none()
    if pv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product version not found")
    if pv.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot create a BoM for an Archived product version",
            headers={"X-Error-Code": "ARCHIVED_VERSION_REFERENCE"},
        )

    # Auto-generate bom_version as "ProductName N" (incremental per product)
    count_result = await db.execute(
        select(func.count()).select_from(Bom).where(Bom.product_version_id == payload.product_version_id)
    )
    existing_count = count_result.scalar() or 0
    # Count all BoMs for any version of this product
    all_versions_result = await db.execute(
        select(ProductVersion.version_id).where(ProductVersion.product_id == pv.product_id)
    )
    version_ids = [row[0] for row in all_versions_result.fetchall()]
    if version_ids:
        total_count_result = await db.execute(
            select(func.count()).select_from(Bom).where(Bom.product_version_id.in_(version_ids))
        )
        total_count = total_count_result.scalar() or 0
    else:
        total_count = 0

    bom_version = payload.bom_version or f"{pv.product_name} {total_count + 1}"

    new_bom = Bom(
        product_version_id=payload.product_version_id,
        bom_version=bom_version,
        reference=payload.reference,
        quantity=payload.quantity,
        unit_of_measure=payload.unit_of_measure,
    )
    db.add(new_bom)
    await db.commit()
    await db.refresh(new_bom)

    result2 = await db.execute(
        select(Bom)
        .where(Bom.bom_id == new_bom.bom_id)
        .options(selectinload(Bom.components), selectinload(Bom.operations))
    )
    return await _bom_to_out(result2.scalar_one(), db)


@router.post("/{bom_id}/components", response_model=BomComponentOut, status_code=status.HTTP_201_CREATED)
async def add_component(
    bom_id: int,
    payload: BomComponentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Bom).where(Bom.bom_id == bom_id))
    bom = result.scalar_one_or_none()
    if bom is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BoM not found")
    if bom.status == "Archived":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot modify an Archived BoM")
    comp = BomComponent(bom_id=bom_id, product_id=payload.product_id, quantity=payload.quantity, unit_of_measure=payload.unit_of_measure)
    db.add(comp)
    await db.commit()
    await db.refresh(comp)
    return BomComponentOut.model_validate(comp)


@router.delete("/{bom_id}/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_component(
    bom_id: int,
    component_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BomComponent).where(BomComponent.component_id == component_id, BomComponent.bom_id == bom_id)
    )
    comp = result.scalar_one_or_none()
    if comp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    await db.delete(comp)
    await db.commit()


@router.post("/{bom_id}/operations", response_model=BomOperationOut, status_code=status.HTTP_201_CREATED)
async def add_operation(
    bom_id: int,
    payload: BomOperationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Bom).where(Bom.bom_id == bom_id))
    bom = result.scalar_one_or_none()
    if bom is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BoM not found")
    if bom.status == "Archived":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot modify an Archived BoM")
    op = BomOperation(bom_id=bom_id, work_center=payload.work_center, operation_time_mins=payload.operation_time_mins, sequence_order=payload.sequence_order)
    db.add(op)
    await db.commit()
    await db.refresh(op)
    return BomOperationOut.model_validate(op)


@router.delete("/{bom_id}/operations/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_operation(
    bom_id: int,
    operation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BomOperation).where(BomOperation.operation_id == operation_id, BomOperation.bom_id == bom_id)
    )
    op = result.scalar_one_or_none()
    if op is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operation not found")
    await db.delete(op)
    await db.commit()
