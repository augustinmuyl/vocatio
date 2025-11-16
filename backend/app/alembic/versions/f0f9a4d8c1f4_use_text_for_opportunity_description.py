"""use text for opportunity description

Revision ID: f0f9a4d8c1f4
Revises: 7e3b2c4d5f6a
Create Date: 2025-10-07 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "f0f9a4d8c1f4"
down_revision: str | Sequence[str] | None = "7e3b2c4d5f6a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "opportunities",
        "description",
        existing_type=sa.String(length=4000),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "opportunities",
        "description",
        existing_type=sa.Text(),
        type_=sa.String(length=4000),
        existing_nullable=False,
    )
