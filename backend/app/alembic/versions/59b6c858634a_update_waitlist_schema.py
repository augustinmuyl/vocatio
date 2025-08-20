"""update waitlist schema

Revision ID: 59b6c858634a
Revises: 9ac5b24c3549
Create Date: 2025-08-20 15:37:20.241048

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '59b6c858634a'
down_revision: Union[str, Sequence[str], None] = '9ac5b24c3549'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("waitlist_entries", "school")
    op.drop_column("waitlist_entries", "requirement")
    op.drop_column("waitlist_entries", "hours_needed")
    op.drop_column("waitlist_entries", "org_name")
    op.drop_column("waitlist_entries", "org_role")
    op.drop_column("waitlist_entries", "org_opportunities")
    op.add_column(
        "waitlist_entries",
        sa.Column("additional_info", sa.Text(), nullable=True),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column("consent", sa.Boolean(), nullable=False),
    )
    op.execute(sa.text("DROP TYPE IF EXISTS waitlist_requirement_enum"))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("waitlist_entries", "consent")
    op.drop_column("waitlist_entries", "additional_info")
    op.add_column(
        "waitlist_entries",
        sa.Column("org_opportunities", sa.Text(), nullable=True),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column("org_role", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column("org_name", sa.String(length=200), nullable=True),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column("hours_needed", sa.Integer(), nullable=True),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column(
            "requirement",
            sa.Enum(
                "graduation",
                "bright_futures",
                "honor_cord",
                "other",
                name="waitlist_requirement_enum",
            ),
            nullable=True,
        ),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column("school", sa.String(length=200), nullable=True),
    )
