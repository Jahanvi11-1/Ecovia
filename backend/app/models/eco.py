from sqlalchemy import (
    Boolean, CheckConstraint, Column, DateTime, ForeignKey,
    Integer, String, Text, func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class EcoStage(Base):
    __tablename__ = "eco_stages"

    stage_id = Column(Integer, primary_key=True, autoincrement=True)
    stage_name = Column(String(100), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    requires_approval = Column(Boolean, server_default="false")
    is_final_stage = Column(Boolean, server_default="false")
    created_at = Column(DateTime, server_default=func.now())


class Eco(Base):
    __tablename__ = "ecos"

    eco_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    eco_type = Column(String(20), nullable=True)
    target_product_id = Column(Integer, ForeignKey("products.product_id"), nullable=True)
    target_bom_id = Column(Integer, ForeignKey("boms.bom_id"), nullable=True)
    current_stage_id = Column(Integer, ForeignKey("eco_stages.stage_id"), nullable=True)
    version_update_toggle = Column(Boolean, server_default="true")
    effective_date = Column(DateTime, nullable=True)
    proposed_changes = Column(JSONB, nullable=True)
    status = Column(String(20), server_default="Open")
    is_started = Column(Boolean, server_default="false")
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("eco_type IN ('Product', 'BoM')", name="ecos_eco_type_check"),
        CheckConstraint("status IN ('Open', 'Validated', 'Applied', 'Rejected')", name="ecos_status_check"),
    )

    current_stage = relationship("EcoStage", foreign_keys=[current_stage_id])
    creator = relationship("User", foreign_keys=[created_by])
    target_product = relationship("Product", foreign_keys=[target_product_id])
    target_bom = relationship("Bom", foreign_keys=[target_bom_id])


class StageApprovalRule(Base):
    __tablename__ = "stage_approval_rules"

    rule_id = Column(Integer, primary_key=True, autoincrement=True)
    stage_id = Column(Integer, ForeignKey("eco_stages.stage_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    approval_category = Column(String(20), nullable=False, server_default="Required")
    created_at = Column(DateTime, server_default=func.now())

    stage = relationship("EcoStage", foreign_keys=[stage_id])
    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        CheckConstraint("approval_category IN ('Required', 'Optional')", name="approval_category_check"),
    )


class EcoLog(Base):
    __tablename__ = "eco_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    eco_id = Column(Integer, ForeignKey("ecos.eco_id", ondelete="CASCADE"), nullable=True)
    stage_id = Column(Integer, ForeignKey("eco_stages.stage_id"), nullable=True)
    action_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    action_taken = Column(String(50), nullable=True)
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
