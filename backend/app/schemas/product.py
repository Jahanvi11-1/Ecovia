from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    product_code: str
    product_name: str
    sale_price: Optional[float] = None
    cost_price: Optional[float] = None
    attachments_url: Optional[str] = None


class ProductVersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    version_id: int
    product_id: int
    version_number: int
    product_name: str
    sale_price: Optional[float] = None
    cost_price: Optional[float] = None
    attachments_url: Optional[str] = None
    status: str
    is_latest: bool
    created_at: Optional[datetime] = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    product_code: str
    created_at: Optional[datetime] = None
    active_version: Optional[ProductVersionOut] = None
    versions: list[ProductVersionOut] = []
