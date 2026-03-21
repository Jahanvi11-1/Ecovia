"""Increase bom_version column length to 100

Revision ID: 003
Revises: 002
Create Date: 2024-01-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    try:
        op.alter_column("boms", "bom_version", type_=sa.String(100), existing_nullable=False)
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.alter_column("boms", "bom_version", type_=sa.String(20), existing_nullable=False)
    except Exception:
        pass
