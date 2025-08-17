"""add waitlist entry table

Revision ID: bc847e9044f6
Revises: ff9c2b278644
Create Date: 2025-08-17 17:05:13.387362

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bc847e9044f6"
down_revision: str | Sequence[str] | None = "ff9c2b278644"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "waitlist_entries",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column(
            "role",
            sa.Enum(
                "student",
                "parent",
                "organization",
                "other",
                name="waitlist_role_enum",
            ),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("school", sa.String(length=200), nullable=True),
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
        sa.Column("hours_needed", sa.Integer(), nullable=True),
        sa.Column("org_name", sa.String(length=200), nullable=True),
        sa.Column("org_role", sa.String(length=100), nullable=True),
        sa.Column("org_opportunities", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=True,
        ),
        sa.UniqueConstraint("email", "role", name="uq_waitlist_email_role"),
    )
    op.execute(
        sa.text(
            'CREATE SEQUENCE IF NOT EXISTS waitlist_entry_id_seq OWNED BY waitlist_entries.id'
        )
    )
    op.execute(
        sa.text(
            "ALTER TABLE waitlist_entries ALTER COLUMN id SET DEFAULT nextval('waitlist_entry_id_seq')"
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("waitlist_entries")
    op.execute(sa.text("DROP TYPE IF EXISTS waitlist_requirement_enum"))
    op.execute(sa.text("DROP TYPE IF EXISTS waitlist_role_enum"))
    op.execute(sa.text("DROP SEQUENCE IF EXISTS waitlist_entry_id_seq"))
