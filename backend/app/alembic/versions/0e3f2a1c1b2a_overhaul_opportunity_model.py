"""overhaul opportunity model

Revision ID: 0e3f2a1c1b2a
Revises: 59b6c858634a
Create Date: 2025-09-15 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql as pg

revision: str = "0e3f2a1c1b2a"
down_revision: str | Sequence[str] | None = "b841ed6684d2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add new columns (with temporary defaults where needed for non-null)
    op.add_column("opportunities", sa.Column("slug", sa.String(length=100), nullable=True))
    op.add_column(
        "opportunities",
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "opportunities",
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "opportunities",
        sa.Column("timezone", sa.String(length=64), nullable=False, server_default="America/New_York"),
    )

    # Create enum for location (Postgres); on SQLite it will be a CHECKed TEXT
    location_enum = sa.Enum("NYC", "MIAMI", "OTHER", "REMOTE", name="opportunity_location_enum")
    location_enum.create(op.get_bind(), checkfirst=True)
    op.add_column("opportunities", sa.Column("location", location_enum, nullable=True))

    # Make address nullable (REMOTE allowed)
    op.alter_column("opportunities", "address", existing_type=sa.String(length=200), nullable=True)

    # Make zip_code nullable
    op.alter_column("opportunities", "zip_code", existing_type=sa.String(length=10), nullable=True)

    # Themes as JSON array (stored as JSONB on Postgres for indexing)
    if op.get_bind().dialect.name == "postgresql":
        op.add_column("opportunities", sa.Column("themes", pg.JSONB(astext_type=sa.Text()), nullable=True))
    else:
        op.add_column("opportunities", sa.Column("themes", sa.JSON(), nullable=True))

    # Add optional signup_url
    op.add_column("opportunities", sa.Column("signup_url", sa.String(length=2048), nullable=True))

    # Increase description length
    op.alter_column(
        "opportunities",
        "description",
        existing_type=sa.String(length=1000),
        type_=sa.String(length=4000),
        existing_nullable=False,
    )

    # Drop old columns
    with op.batch_alter_table("opportunities") as batch_op:
        batch_op.drop_column("city")
        batch_op.drop_column("state")
        batch_op.drop_column("event_date")

    # Backfill transient defaults for not-nullables if table has data
    # Note: for existing rows, we set conservative defaults
    op.execute(sa.text("UPDATE opportunities SET start_at = COALESCE(start_at, now()), end_at = COALESCE(end_at, now() + interval '1 hour')"))
    op.execute(sa.text("UPDATE opportunities SET slug = COALESCE(slug, lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')))") )
    op.execute(sa.text("UPDATE opportunities SET location = COALESCE(location, 'OTHER')::opportunity_location_enum"))

    # Enforce non-null and add constraints
    op.alter_column("opportunities", "slug", nullable=False)
    op.alter_column("opportunities", "start_at", nullable=False)
    op.alter_column("opportunities", "end_at", nullable=False)
    op.alter_column("opportunities", "location", nullable=False)

    # Add unique index and check constraint
    op.create_index(op.f("ix_opportunities_slug"), "opportunities", ["slug"], unique=True)
    op.create_check_constraint(
        "ck_opportunity_end_after_start",
        "opportunities",
        sa.text("(end_at > start_at)"),
    )
    # Address required for non-REMOTE
    if op.get_bind().dialect.name == "postgresql":
        op.create_check_constraint(
            "ck_opportunity_address_required",
            "opportunities",
            sa.text("(location = 'REMOTE'::opportunity_location_enum OR address IS NOT NULL)"),
        )
    else:
        op.create_check_constraint(
            "ck_opportunity_address_required",
            "opportunities",
            sa.text("(location = 'REMOTE' OR address IS NOT NULL)"),
        )

    # Performance indexes
    op.create_index("ix_opportunities_location", "opportunities", ["location"], unique=False)
    op.create_index("ix_opportunities_start_at", "opportunities", ["start_at"], unique=False)
    op.create_index("ix_opportunities_is_active", "opportunities", ["is_active"], unique=False)
    op.create_index("ix_opportunities_org_id", "opportunities", ["org_id"], unique=False)

    # GIN index for themes on Postgres
    if op.get_bind().dialect.name == "postgresql":
        op.execute(
            sa.text(
                "CREATE INDEX ix_opportunities_themes_gin ON opportunities USING GIN (themes)"
            )
        )


def downgrade() -> None:
    # Drop constraints and index
    op.drop_constraint("ck_opportunity_end_after_start", "opportunities", type_="check")
    op.drop_index(op.f("ix_opportunities_slug"), table_name="opportunities")

    # Recreate old columns
    with op.batch_alter_table("opportunities") as batch_op:
        batch_op.add_column(sa.Column("event_date", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")))
        batch_op.add_column(sa.Column("city", sa.String(length=100), nullable=False, server_default=""))
        batch_op.add_column(sa.Column("state", sa.String(length=100), nullable=False, server_default=""))

    # Revert description length
    op.alter_column(
        "opportunities",
        "description",
        existing_type=sa.String(length=4000),
        type_=sa.String(length=1000),
        existing_nullable=False,
    )

    # Drop indexes
    if op.get_bind().dialect.name == "postgresql":
        op.execute(sa.text("DROP INDEX IF EXISTS ix_opportunities_themes_gin"))
    op.drop_index("ix_opportunities_is_active", table_name="opportunities")
    op.drop_index("ix_opportunities_start_at", table_name="opportunities")
    op.drop_index("ix_opportunities_location", table_name="opportunities")
    op.drop_index("ix_opportunities_org_id", table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_slug"), table_name="opportunities")

    # Drop new columns
    op.drop_column("opportunities", "signup_url")
    op.drop_column("opportunities", "themes")
    op.alter_column("opportunities", "zip_code", existing_type=sa.String(length=10), nullable=False)
    op.alter_column("opportunities", "address", existing_type=sa.String(length=200), nullable=False)
    op.drop_column("opportunities", "location")
    op.drop_column("opportunities", "timezone")
    op.drop_column("opportunities", "end_at")
    op.drop_column("opportunities", "start_at")
    op.drop_column("opportunities", "slug")

    # Drop enum type
    op.execute(sa.text("DROP TYPE IF EXISTS opportunity_location_enum"))
