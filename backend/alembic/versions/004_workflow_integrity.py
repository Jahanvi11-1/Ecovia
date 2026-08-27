"""Add approval records and workflow integrity constraints."""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "eco_approvals",
        sa.Column("approval_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("eco_id", sa.Integer(), sa.ForeignKey("ecos.eco_id", ondelete="CASCADE"), nullable=False),
        sa.Column("stage_id", sa.Integer(), sa.ForeignKey("eco_stages.stage_id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("eco_id", "stage_id", "user_id", name="uq_eco_stage_approval_user"),
    )
    op.create_unique_constraint("uq_stage_approval_user", "stage_approval_rules", ["stage_id", "user_id"])
    op.create_unique_constraint("uq_eco_stage_sequence", "eco_stages", ["sequence_order"])


def downgrade() -> None:
    op.drop_constraint("uq_eco_stage_sequence", "eco_stages", type_="unique")
    op.drop_constraint("uq_stage_approval_user", "stage_approval_rules", type_="unique")
    op.drop_table("eco_approvals")
