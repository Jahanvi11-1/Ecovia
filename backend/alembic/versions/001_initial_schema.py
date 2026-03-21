"""Initial schema — all tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("login_id", sa.String(12), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.String(30),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.CheckConstraint(
            "role IN ('Admin', 'Engineering User', 'Approver', 'Operations User')",
            name="users_role_check",
        ),
    )

    # products
    op.create_table(
        "products",
        sa.Column("product_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_code", sa.String(50), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # product_versions
    op.create_table(
        "product_versions",
        sa.Column("version_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.product_id", ondelete="CASCADE"), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("sale_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("cost_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("attachments_url", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), server_default="Active"),
        sa.Column("is_latest", sa.Boolean(), server_default=sa.text("TRUE")),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.CheckConstraint(
            "status IN ('Active', 'Archived')",
            name="product_versions_status_check",
        ),
        sa.UniqueConstraint("product_id", "version_number", name="uq_product_version"),
    )

    # boms
    op.create_table(
        "boms",
        sa.Column("bom_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "product_version_id",
            sa.Integer(),
            sa.ForeignKey("product_versions.version_id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("bom_version", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), server_default="Active"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.CheckConstraint(
            "status IN ('Active', 'Archived')",
            name="boms_status_check",
        ),
    )

    # bom_components
    op.create_table(
        "bom_components",
        sa.Column("component_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("bom_id", sa.Integer(), sa.ForeignKey("boms.bom_id", ondelete="CASCADE"), nullable=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.product_id"), nullable=True),
        sa.Column("quantity", sa.Numeric(12, 4), nullable=False),
        sa.Column("unit_of_measure", sa.String(20), server_default="Unit"),
    )

    # bom_operations
    op.create_table(
        "bom_operations",
        sa.Column("operation_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("bom_id", sa.Integer(), sa.ForeignKey("boms.bom_id", ondelete="CASCADE"), nullable=True),
        sa.Column("work_center", sa.String(100), nullable=False),
        sa.Column("operation_time_mins", sa.Integer(), nullable=False),
        sa.Column("sequence_order", sa.Integer(), nullable=False),
    )

    # eco_stages
    op.create_table(
        "eco_stages",
        sa.Column("stage_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("stage_name", sa.String(100), nullable=False),
        sa.Column("sequence_order", sa.Integer(), nullable=False),
        sa.Column("requires_approval", sa.Boolean(), server_default=sa.text("FALSE")),
        sa.Column("is_final_stage", sa.Boolean(), server_default=sa.text("FALSE")),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # ecos
    op.create_table(
        "ecos",
        sa.Column("eco_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("eco_type", sa.String(20), nullable=True),
        sa.Column("target_product_id", sa.Integer(), sa.ForeignKey("products.product_id"), nullable=True),
        sa.Column("target_bom_id", sa.Integer(), sa.ForeignKey("boms.bom_id"), nullable=True),
        sa.Column("current_stage_id", sa.Integer(), sa.ForeignKey("eco_stages.stage_id"), nullable=True),
        sa.Column("version_update_toggle", sa.Boolean(), server_default=sa.text("TRUE")),
        sa.Column("effective_date", sa.TIMESTAMP(), nullable=True),
        sa.Column("proposed_changes", postgresql.JSONB(), nullable=True),
        sa.Column("status", sa.String(20), server_default="Open"),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.CheckConstraint(
            "eco_type IN ('Product', 'BoM')",
            name="ecos_eco_type_check",
        ),
        sa.CheckConstraint(
            "status IN ('Open', 'Validated', 'Applied', 'Rejected')",
            name="ecos_status_check",
        ),
    )

    # eco_logs
    op.create_table(
        "eco_logs",
        sa.Column("log_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("eco_id", sa.Integer(), sa.ForeignKey("ecos.eco_id", ondelete="CASCADE"), nullable=True),
        sa.Column("stage_id", sa.Integer(), sa.ForeignKey("eco_stages.stage_id"), nullable=True),
        sa.Column("action_by", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=True),
        sa.Column("action_taken", sa.String(50), nullable=True),
        sa.Column("old_value", postgresql.JSONB(), nullable=True),
        sa.Column("new_value", postgresql.JSONB(), nullable=True),
        sa.Column(
            "timestamp",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )


def downgrade() -> None:
    op.drop_table("eco_logs")
    op.drop_table("ecos")
    op.drop_table("eco_stages")
    op.drop_table("bom_operations")
    op.drop_table("bom_components")
    op.drop_table("boms")
    op.drop_table("product_versions")
    op.drop_table("products")
    op.drop_table("users")
