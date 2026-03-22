from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class BomComponentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    component_id: int
    bom_id: int
    product_id: Optional[int] = None
    quantity: float
    unit_of_measure: str


class BomComponentCreate(BaseModel):
    product_id: int
    quantity: float
    unit_of_measure: str = "Units"


class BomOperationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    operation_id: int
    bom_id: int
    work_center: str
    operation_time_mins: int
    sequence_order: int


class BomOperationCreate(BaseModel):
    work_center: str
    operation_time_mins: int
    sequence_order: int


class BomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    bom_id: int
    product_version_id: Optional[int] = None
    bom_version: str
    reference: Optional[str] = None
    quantity: Optional[float] = None
    unit_of_measure: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    product_name: Optional[str] = None  # resolved from product_version → product_name
    components: list[BomComponentOut] = []
    operations: list[BomOperationOut] = []


class PaginatedBomsOut(BaseModel):
    items: List[BomOut]
    total: int
    page: int
    limit: int
    pages: int


class BomCreate(BaseModel):
    product_version_id: int
    bom_version: Optional[str] = None
    reference: Optional[str] = None
    quantity: float = 1.0
    unit_of_measure: str = "Units"
