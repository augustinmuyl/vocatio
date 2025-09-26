"""convert integer identifiers to UUIDs

Revision ID: 7e3b2c4d5f6a
Revises: 3c1f7a2e1abc
Create Date: 2024-03-17 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql as pg

# revision identifiers, used by Alembic.
revision: str = "7e3b2c4d5f6a"
down_revision: str | Sequence[str] | None = "3c1f7a2e1abc"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        raise RuntimeError("UUID migration requires PostgreSQL")

    op.execute(sa.text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))

    # Add UUID columns with temporary defaults for backfilling
    op.add_column(
        "accounts",
        sa.Column(
            "id_uuid",
            pg.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
    )
    op.add_column(
        "organizations",
        sa.Column("account_id_uuid", pg.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("account_id_uuid", pg.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "opportunities",
        sa.Column(
            "id_uuid",
            pg.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
    )
    op.add_column(
        "opportunities",
        sa.Column("org_id_uuid", pg.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column(
            "id_uuid",
            pg.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
    )

    # Backfill new UUID columns based on existing relationships
    op.execute(
        sa.text(
            """
            UPDATE organizations AS org
            SET account_id_uuid = acct.id_uuid
            FROM accounts AS acct
            WHERE org.account_id = acct.id
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE user_profiles AS profile
            SET account_id_uuid = acct.id_uuid
            FROM accounts AS acct
            WHERE profile.account_id = acct.id
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE opportunities AS opp
            SET org_id_uuid = org.account_id_uuid
            FROM organizations AS org
            WHERE opp.org_id = org.account_id
            """
        )
    )

    # Drop constraints referencing legacy integer identifiers
    with op.batch_alter_table("opportunities") as batch_op:
        batch_op.drop_constraint("opportunities_org_id_fkey", type_="foreignkey")
        batch_op.drop_constraint("opportunities_pkey", type_="primary")
        batch_op.drop_index("ix_opportunities_org_id")
    with op.batch_alter_table("organizations") as batch_op:
        batch_op.drop_constraint("organizations_account_id_fkey", type_="foreignkey")
        batch_op.drop_constraint("organizations_pkey", type_="primary")
    with op.batch_alter_table("user_profiles") as batch_op:
        batch_op.drop_constraint("user_profiles_account_id_fkey", type_="foreignkey")
        batch_op.drop_constraint("user_profiles_pkey", type_="primary")
    with op.batch_alter_table("waitlist_entries") as batch_op:
        batch_op.drop_constraint("waitlist_entries_pkey", type_="primary")
    with op.batch_alter_table("accounts") as batch_op:
        batch_op.drop_constraint("accounts_pkey", type_="primary")

    # Remove legacy integer columns
    op.drop_column("opportunities", "org_id")
    op.drop_column("opportunities", "id")
    op.drop_column("organizations", "account_id")
    op.drop_column("user_profiles", "account_id")
    op.drop_column("waitlist_entries", "id")
    op.drop_column("accounts", "id")

    # Rename UUID columns to canonical names
    op.alter_column("accounts", "id_uuid", new_column_name="id")
    op.alter_column("organizations", "account_id_uuid", new_column_name="account_id")
    op.alter_column("user_profiles", "account_id_uuid", new_column_name="account_id")
    op.alter_column("opportunities", "id_uuid", new_column_name="id")
    op.alter_column("opportunities", "org_id_uuid", new_column_name="org_id")
    op.alter_column("waitlist_entries", "id_uuid", new_column_name="id")

    # Reinstate constraints on UUID identifiers
    op.create_primary_key("accounts_pkey", "accounts", ["id"])
    op.create_primary_key("waitlist_entries_pkey", "waitlist_entries", ["id"])
    op.create_primary_key("organizations_pkey", "organizations", ["account_id"])
    op.create_primary_key("user_profiles_pkey", "user_profiles", ["account_id"])
    op.create_primary_key("opportunities_pkey", "opportunities", ["id"])

    op.create_foreign_key(
        "organizations_account_id_fkey",
        "organizations",
        "accounts",
        ["account_id"],
        ["id"],
    )
    op.create_foreign_key(
        "user_profiles_account_id_fkey",
        "user_profiles",
        "accounts",
        ["account_id"],
        ["id"],
    )
    op.create_foreign_key(
        "opportunities_org_id_fkey",
        "opportunities",
        "organizations",
        ["org_id"],
        ["account_id"],
    )
    op.create_index("ix_opportunities_org_id", "opportunities", ["org_id"], unique=False)

    # Harden nullability and remove temporary defaults
    op.alter_column(
        "organizations",
        "account_id",
        existing_type=pg.UUID(as_uuid=True),
        nullable=False,
    )
    op.alter_column(
        "user_profiles",
        "account_id",
        existing_type=pg.UUID(as_uuid=True),
        nullable=False,
    )
    op.alter_column(
        "opportunities",
        "org_id",
        existing_type=pg.UUID(as_uuid=True),
        nullable=False,
    )

    op.alter_column(
        "accounts",
        "id",
        existing_type=pg.UUID(as_uuid=True),
        server_default=None,
    )
    op.alter_column(
        "opportunities",
        "id",
        existing_type=pg.UUID(as_uuid=True),
        server_default=None,
    )
    op.alter_column(
        "waitlist_entries",
        "id",
        existing_type=pg.UUID(as_uuid=True),
        server_default=None,
    )

    # Drop legacy sequences
    op.execute(sa.text("DROP SEQUENCE IF EXISTS account_id_seq"))
    op.execute(sa.text("DROP SEQUENCE IF EXISTS opportunity_id_seq"))
    op.execute(sa.text("DROP SEQUENCE IF EXISTS waitlist_entry_id_seq"))


def downgrade() -> None:
    raise RuntimeError("Downgrade not supported for UUID migration")
