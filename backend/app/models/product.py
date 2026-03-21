from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, autoincrement=True)
    product_code = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    versions = relationship("ProductVersion", back_populates="product")


class ProductVersion(Base):
    __tablename__ = "product_versions"

    version_id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
    )
    version_number = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    sale_price = Column(Numeric(12, 2), nullable=True)
    cost_price = Column(Numeric(12, 2), nullable=True)
    attachments_url = Column(Text, nullable=True)
    status = Column(String(20), server_default="Active")
    is_latest = Column(Boolean, server_default="true")
    created_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True,
    )
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("product_id", "version_number", name="uq_product_version"),
        CheckConstraint(
            "status IN ('Active', 'Archived')",
            name="product_versions_status_check",
        ),
    )

    product = relationship("Product", back_populates="versions")
    creator = relationship("User", foreign_keys=[created_by])
