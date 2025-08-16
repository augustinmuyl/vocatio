"""use dedicated sequences for user and opportunity id

Revision ID: ff9c2b278644
Revises: dcb1c0f35e05
Create Date: 2025-08-16 14:30:22.329196

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ff9c2b278644"
down_revision: str | Sequence[str] | None = "dcb1c0f35e05"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(sa.text('CREATE SEQUENCE IF NOT EXISTS user_id_seq OWNED BY "user".id'))
    op.execute(sa.text("ALTER TABLE \"user\" ALTER COLUMN id SET DEFAULT nextval('user_id_seq')"))
    op.execute(sa.text('CREATE SEQUENCE IF NOT EXISTS opportunity_id_seq OWNED BY opportunity.id'))
    op.execute(sa.text("ALTER TABLE opportunity ALTER COLUMN id SET DEFAULT nextval('opportunity_id_seq')"))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(sa.text("ALTER TABLE opportunity ALTER COLUMN id DROP DEFAULT"))
    op.execute(sa.text("ALTER TABLE \"user\" ALTER COLUMN id DROP DEFAULT"))
    op.execute(sa.text('DROP SEQUENCE IF EXISTS opportunity_id_seq'))
    op.execute(sa.text('DROP SEQUENCE IF EXISTS user_id_seq'))
