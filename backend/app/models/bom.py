from sqlalchemy import (
    Boolean, CheckConstraint, Column, DateTime, ForeignKey,
    Integer, Numeric, String, func,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Bom(Base):
    __tablename__ = "boms"

    bom_id = Column(Integer, primary_key=True, autoincrement=True)
    product_version_id = Column(
        Integer,
        ForeignKey("product_versions.version_id", ondelete="CASCADE"),
        nullable=True,
    )
    bom_version = Column(String(100), nullable=False)
    reference = Column(String(8), nullable=True)
    quantity = Column(Numeric(12, 4), server_default="1")
    unit_of_measure = Column(String(20), server_default="Units")
    status = Column(String(20), server_default="Active")
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("status IN ('Active', 'Archived')", name="boms_status_check"),
    )

    product_version = relationship("ProductVersion", foreign_keys=[product_version_id])
    components = relationship("BomComponent", back_populates="bom", cascade="all, delete-orphan")
    operations = relationship("BomOperation", back_populates="bom", cascade="all, delete-orphan")


class BomComponent(Base):
    __tablename__ = "bom_components"

    component_id = Column(Integer, primary_key=True, autoincrement=True)
    bom_id = Column(Integer, ForeignKey("boms.bom_id", ondelete="CASCADE"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=True)
    quantity = Column(Numeric(12, 4), nullable=False)
    unit_of_measure = Column(String(20), server_default="Unit")

    bom = relationship("Bom", back_populates="components")
    product = relationship("Product", foreign_keys=[product_id])


class BomOperation(Base):
    __tablename__ = "bom_operations"

    operation_id = Column(Integer, primary_key=True, autoincrement=True)
    bom_id = Column(Integer, ForeignKey("boms.bom_id", ondelete="CASCADE"), nullable=True)
    work_center = Column(String(100), nullable=False)
    operation_time_mins = Column(Integer, nullable=False)
    sequence_order = Column(Integer, nullable=False)

    bom = relationship("Bom", back_populates="operations")
