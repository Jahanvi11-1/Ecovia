from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.deps import require_roles, get_current_user
from app.models.eco import Eco, EcoStage, StageApprovalRule
from app.models.user import User
from app.schemas.eco_stage import (
    EcoStageCreate, EcoStageUpdate, EcoStageOut,
    ApprovalRuleCreate, ApprovalRuleOut, UserRoleUpdate,
)

router = APIRouter(prefix="/api/settings", tags=["settings"])

_admin_only = require_roles("Admin")


# ── Stages ────────────────────────────────────────────────────────────────────

@router.get("/stages", response_model=list[EcoStageOut])
async def list_stages(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(EcoStage).order_by(EcoStage.sequence_order))
    return [EcoStageOut.model_validate(s) for s in result.scalars().all()]


@router.post("/stages", response_model=EcoStageOut, status_code=status.HTTP_201_CREATED)
async def create_stage(
    payload: EcoStageCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    if payload.is_final_stage:
        existing = await db.execute(select(EcoStage).where(EcoStage.is_final_stage == True))  # noqa: E712
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A final stage already exists. Only one stage can be marked as final.",
                headers={"X-Error-Code": "DUPLICATE_FINAL_STAGE"},
            )

    duplicate = await db.execute(select(EcoStage).where(EcoStage.sequence_order == payload.sequence_order))
    if duplicate.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Stage sequence order must be unique")

    stage = EcoStage(**payload.model_dump())
    db.add(stage)
    await db.commit()
    await db.refresh(stage)
    return EcoStageOut.model_validate(stage)


@router.put("/stages/{stage_id}", response_model=EcoStageOut)
async def update_stage(
    stage_id: int,
    payload: EcoStageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    result = await db.execute(select(EcoStage).where(EcoStage.stage_id == stage_id))
    stage = result.scalar_one_or_none()
    if stage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found")

    if payload.is_final_stage is True and not stage.is_final_stage:
        existing = await db.execute(
            select(EcoStage).where(EcoStage.is_final_stage == True, EcoStage.stage_id != stage_id)  # noqa: E712
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A final stage already exists. Only one stage can be marked as final.",
                headers={"X-Error-Code": "DUPLICATE_FINAL_STAGE"},
            )

    if payload.sequence_order is not None and payload.sequence_order != stage.sequence_order:
        duplicate = await db.execute(select(EcoStage).where(
            EcoStage.sequence_order == payload.sequence_order,
            EcoStage.stage_id != stage_id,
        ))
        if duplicate.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="Stage sequence order must be unique")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(stage, field, value)

    await db.commit()
    await db.refresh(stage)
    return EcoStageOut.model_validate(stage)


@router.delete("/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stage(
    stage_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    result = await db.execute(select(EcoStage).where(EcoStage.stage_id == stage_id))
    stage = result.scalar_one_or_none()
    if stage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found")
    if stage.is_final_stage:
        raise HTTPException(status_code=409, detail="A final stage cannot be deleted; designate another final stage first")
    in_use = await db.execute(select(Eco.eco_id).where(Eco.current_stage_id == stage_id).limit(1))
    if in_use.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Cannot delete a stage used by an ECO")
    await db.delete(stage)
    await db.commit()


# ── Approval Rules per Stage ──────────────────────────────────────────────────

@router.get("/stages/{stage_id}/approvals", response_model=list[ApprovalRuleOut])
async def list_stage_approvals(
    stage_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    result = await db.execute(
        select(StageApprovalRule, User.login_id)
        .join(User, StageApprovalRule.user_id == User.user_id)
        .where(StageApprovalRule.stage_id == stage_id)
    )
    rows = result.all()
    return [
        ApprovalRuleOut(
            rule_id=r.StageApprovalRule.rule_id,
            stage_id=r.StageApprovalRule.stage_id,
            user_id=r.StageApprovalRule.user_id,
            approval_category=r.StageApprovalRule.approval_category,
            user_login_id=r.login_id,
        )
        for r in rows
    ]


@router.post("/stages/{stage_id}/approvals", response_model=ApprovalRuleOut, status_code=status.HTTP_201_CREATED)
async def add_stage_approval(
    stage_id: int,
    payload: ApprovalRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    # Verify stage exists
    stage = (await db.execute(select(EcoStage).where(EcoStage.stage_id == stage_id))).scalar_one_or_none()
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")

    # Verify user exists
    user = (await db.execute(select(User).where(User.user_id == payload.user_id))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.approval_category not in ("Required", "Optional"):
        raise HTTPException(status_code=400, detail="approval_category must be 'Required' or 'Optional'")

    rule = StageApprovalRule(
        stage_id=stage_id,
        user_id=payload.user_id,
        approval_category=payload.approval_category,
    )
    existing_rule = await db.execute(select(StageApprovalRule).where(
        StageApprovalRule.stage_id == stage_id,
        StageApprovalRule.user_id == payload.user_id,
    ))
    if existing_rule.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="This user is already assigned to the stage")
    db.add(rule)
    await db.commit()
    await db.refresh(rule)

    return ApprovalRuleOut(
        rule_id=rule.rule_id,
        stage_id=rule.stage_id,
        user_id=rule.user_id,
        approval_category=rule.approval_category,
        user_login_id=user.login_id,
    )


@router.delete("/stages/{stage_id}/approvals/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stage_approval(
    stage_id: int,
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    result = await db.execute(
        select(StageApprovalRule).where(
            StageApprovalRule.rule_id == rule_id,
            StageApprovalRule.stage_id == stage_id,
        )
    )
    rule = result.scalar_one_or_none()
    if rule is None:
        raise HTTPException(status_code=404, detail="Approval rule not found")
    await db.delete(rule)
    await db.commit()


# ── Users list (for dropdowns) ────────────────────────────────────────────────

@router.get("/users", response_model=list[dict])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(_admin_only),
):
    result = await db.execute(select(User).order_by(User.login_id))
    return [{"user_id": u.user_id, "login_id": u.login_id, "role": u.role} for u in result.scalars().all()]


@router.put("/users/{user_id}/role", response_model=dict)
async def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_admin_only),
):
    if user_id == current_user.user_id and payload.role != "Admin":
        raise HTTPException(status_code=409, detail="You cannot remove your own Admin role")
    user = (await db.execute(select(User).where(User.user_id == user_id))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    await db.commit()
    return {"user_id": user.user_id, "login_id": user.login_id, "role": user.role}
