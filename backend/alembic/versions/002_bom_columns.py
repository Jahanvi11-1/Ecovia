"""Add reference, quantity, unit_of_measure to boms; add stage_approval_rules; add is_started to ecos

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to boms — wrapped in try/except in case they already exist
    try:
        op.add_column("boms", sa.Column("reference", sa.String(50), nullable=True))
    except Exception:
        pass
    try:
        op.add_column("boms", sa.Column("quantity", sa.Numeric(12, 4), nullable=True, server_default="1"))
    except Exception:
        pass
    try:
        op.add_column("boms", sa.Column("unit_of_measure", sa.String(20), nullable=True, server_default="Units"))
    except Exception:
        pass

    # Add is_started to ecos (may already exist if DB was fresh)
    try:
        op.add_column("ecos", sa.Column("is_started", sa.Boolean(), nullable=True, server_default=sa.text("FALSE")))
    except Exception:
        pass  # column already exists

    # Create stage_approval_rules if not exists
    op.create_table(
        "stage_approval_rules",
        sa.Column("rule_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("stage_id", sa.Integer(), sa.ForeignKey("eco_stages.stage_id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
        sa.Column("approval_category", sa.String(20), nullable=False, server_default="Required"),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.CheckConstraint("approval_category IN ('Required', 'Optional')", name="approval_category_check"),
    )


def downgrade() -> None:
    op.drop_table("stage_approval_rules")
    op.drop_column("ecos", "is_started")
    op.drop_column("boms", "unit_of_measure")
    op.drop_column("boms", "quantity")
    op.drop_column("boms", "reference")
