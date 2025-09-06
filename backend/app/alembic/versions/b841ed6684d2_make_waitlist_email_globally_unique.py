"""make waitlist email globally unique

Revision ID: b841ed6684d2
Revises: 59b6c858634a
Create Date: 2025-08-20 22:06:59.499124

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b841ed6684d2"
down_revision: str | Sequence[str] | None = "59b6c858634a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint("uq_waitlist_email_role", "waitlist_entries", type_="unique")
    op.create_unique_constraint("uq_waitlist_email", "waitlist_entries", ["email"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("uq_waitlist_email", "waitlist_entries", type_="unique")
    op.create_unique_constraint("uq_waitlist_email_role", "waitlist_entries", ["email", "role"])
