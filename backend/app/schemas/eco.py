from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class EcoCreate(BaseModel):
    title: str
    eco_type: str  # "Product" or "BoM"
    target_product_id: int
    target_bom_id: Optional[int] = None
    version_update_toggle: bool = True
    effective_date: datetime
    proposed_changes: dict = {}


class EcoUpdate(BaseModel):
    title: Optional[str] = None
    effective_date: Optional[datetime] = None
    version_update_toggle: Optional[bool] = None
    proposed_changes: Optional[dict] = None
    is_started: Optional[bool] = None


class EcoStageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    stage_id: int
    stage_name: str
    sequence_order: int
    requires_approval: bool
    is_final_stage: bool


class EcoProductRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: int
    product_code: str


class EcoBomRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    bom_id: int
    bom_version: str


class EcoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    eco_id: int
    title: str
    eco_type: Optional[str] = None
    target_product_id: Optional[int] = None
    target_bom_id: Optional[int] = None
    current_stage_id: Optional[int] = None
    version_update_toggle: bool
    effective_date: Optional[datetime] = None
    proposed_changes: Optional[Any] = None
    status: str
    is_started: bool = False
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    current_stage: Optional[EcoStageOut] = None
    target_product: Optional[EcoProductRef] = None
    target_bom: Optional[EcoBomRef] = None
