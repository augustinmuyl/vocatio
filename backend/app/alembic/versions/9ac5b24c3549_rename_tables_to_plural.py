"""rename user and opportunity tables to plural

Revision ID: 9ac5b24c3549
Revises: bc847e9044f6
Create Date: 2025-08-18 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "9ac5b24c3549"
down_revision: str | Sequence[str] | None = "bc847e9044f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("user", "users")
    op.execute(sa.text("ALTER TABLE users RENAME CONSTRAINT user_pkey TO users_pkey"))
    op.execute(sa.text("ALTER INDEX ix_user_email RENAME TO ix_users_email"))
    op.execute(sa.text("ALTER SEQUENCE user_id_seq OWNED BY users.id"))

    op.rename_table("opportunity", "opportunities")
    op.execute(sa.text("ALTER TABLE opportunities RENAME CONSTRAINT opportunity_pkey TO opportunities_pkey"))
    op.execute(sa.text("ALTER TABLE opportunities RENAME CONSTRAINT opportunity_org_id_fkey TO opportunities_org_id_fkey"))
    op.execute(sa.text("ALTER SEQUENCE opportunity_id_seq OWNED BY opportunities.id"))


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table("opportunities", "opportunity")
    op.execute(sa.text("ALTER TABLE opportunity RENAME CONSTRAINT opportunities_pkey TO opportunity_pkey"))
    op.execute(sa.text("ALTER TABLE opportunity RENAME CONSTRAINT opportunities_org_id_fkey TO opportunity_org_id_fkey"))
    op.execute(sa.text("ALTER SEQUENCE opportunity_id_seq OWNED BY opportunity.id"))

    op.rename_table("users", "user")
    op.execute(sa.text("ALTER TABLE \"user\" RENAME CONSTRAINT users_pkey TO user_pkey"))
    op.execute(sa.text("ALTER INDEX ix_users_email RENAME TO ix_user_email"))
    op.execute(sa.text("ALTER SEQUENCE user_id_seq OWNED BY \"user\".id"))
