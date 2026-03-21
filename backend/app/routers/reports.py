from datetime import datetime
from typing import Optional, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.eco import EcoLog
from app.models.product import ProductVersion
from app.models.bom import Bom
from app.models.user import User

router = APIRouter(prefix="/api/reports", tags=["reports"])

_admin_approver = require_roles("Admin", "Approver")


class EcoLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    log_id: int
    eco_id: Optional[int] = None
    stage_id: Optional[int] = None
    action_by: Optional[int] = None
    action_taken: Optional[str] = None
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    timestamp: Optional[datetime] = None


class ProductVersionReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    version_id: int
    product_id: int
    version_number: int
    product_name: str
    status: str
    is_latest: bool
    created_at: Optional[datetime] = None


class BomVersionReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    bom_id: int
    product_version_id: Optional[int] = None
    bom_version: str
    product_name: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None


@router.get("/audit-logs", response_model=list[EcoLogOut])
async def get_audit_logs(
    eco_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_admin_approver),
):
    q = select(EcoLog).order_by(EcoLog.timestamp.desc())
    if eco_id:
        q = q.where(EcoLog.eco_id == eco_id)
    if user_id:
        q = q.where(EcoLog.action_by == user_id)
    if from_date:
        q = q.where(EcoLog.timestamp >= from_date)
    if to_date:
        q = q.where(EcoLog.timestamp <= to_date)
    result = await db.execute(q)
    return [EcoLogOut.model_validate(log) for log in result.scalars().all()]


@router.get("/version-history")
async def get_version_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.product import ProductVersion as PV
    pv_result = await db.execute(select(ProductVersion).order_by(ProductVersion.product_id, ProductVersion.version_number))
    bom_result = await db.execute(select(Bom).order_by(Bom.product_version_id, Bom.bom_id))

    boms = bom_result.scalars().all()

    # Resolve product_name for each BoM
    bom_reports = []
    for b in boms:
        product_name = None
        if b.product_version_id:
            pv = await db.execute(select(PV).where(PV.version_id == b.product_version_id))
            pv_obj = pv.scalar_one_or_none()
            if pv_obj:
                product_name = pv_obj.product_name
        report = BomVersionReport.model_validate(b)
        report.product_name = product_name
        bom_reports.append(report)

    return {
        "product_versions": [ProductVersionReport.model_validate(v) for v in pv_result.scalars().all()],
        "bom_versions": bom_reports,
    }
