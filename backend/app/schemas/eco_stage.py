from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EcoStageCreate(BaseModel):
    stage_name: str
    sequence_order: int
    requires_approval: bool = False
    is_final_stage: bool = False


class EcoStageUpdate(BaseModel):
    stage_name: Optional[str] = None
    sequence_order: Optional[int] = None
    requires_approval: Optional[bool] = None
    is_final_stage: Optional[bool] = None


class EcoStageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stage_id: int
    stage_name: str
    sequence_order: int
    requires_approval: bool
    is_final_stage: bool
    created_at: Optional[datetime] = None


class ApprovalRuleCreate(BaseModel):
    user_id: int
    approval_category: str = "Required"


class ApprovalRuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rule_id: int
    stage_id: int
    user_id: int
    approval_category: str
    user_login_id: Optional[str] = None
