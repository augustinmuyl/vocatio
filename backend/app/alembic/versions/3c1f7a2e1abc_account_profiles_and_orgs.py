"""account + profiles + organizations; rewire opportunity org FK

Revision ID: 3c1f7a2e1abc
Revises: 0e3f2a1c1b2a
Create Date: 2025-09-16 00:00:00.000000
"""

from collections.abc import Sequence
from contextlib import suppress

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c1f7a2e1abc"
down_revision: str | Sequence[str] | None = "0e3f2a1c1b2a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    # Enum type objects (for Postgres); let table creation create them implicitly
    account_kind_enum = sa.Enum("USER", "ORG", name="account_kind_enum")
    persona_type_enum = sa.Enum("STUDENT", "PARENT", "OTHER", name="persona_type_enum")
    profile_location_enum = sa.Enum("NYC", "MIAMI", "OTHER", name="profile_location_enum")

    # accounts table
    op.execute(sa.text('CREATE SEQUENCE IF NOT EXISTS account_id_seq'))
    op.create_table(
        "accounts",
        sa.Column("id", sa.Integer(), sa.Sequence("account_id_seq"), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("kind", account_kind_enum if is_pg else sa.String(length=8), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f("ix_accounts_email"), "accounts", ["email"], unique=True)

    # Backfill accounts from users
    if is_pg:
        op.execute(
            sa.text(
                """
                INSERT INTO accounts (id, email, hashed_password, kind, is_active, created_at, updated_at)
                SELECT id, email, hashed_password,
                       CASE WHEN role = 'ORG' THEN 'ORG'::account_kind_enum ELSE 'USER'::account_kind_enum END,
                       is_active, created_at, updated_at
                FROM users
                """
            )
        )
    else:
        op.execute(
            sa.text(
                """
                INSERT INTO accounts (id, email, hashed_password, kind, is_active, created_at, updated_at)
                SELECT id, email, hashed_password,
                       CASE WHEN role = 'ORG' THEN 'ORG' ELSE 'USER' END,
                       is_active, created_at, updated_at
                FROM users
                """
            )
        )
    # Ensure sequence is aligned (Postgres)
    if is_pg:
        op.execute(sa.text("SELECT setval('account_id_seq', (SELECT COALESCE(MAX(id), 1) FROM accounts))"))

    # organizations table
    op.create_table(
        "organizations",
        sa.Column("account_id", sa.Integer(), sa.ForeignKey("accounts.id"), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("contact_email", sa.String(length=320), nullable=True),
        sa.Column("contact_phone", sa.String(length=32), nullable=True),
        sa.Column("logo_url", sa.String(length=2048), nullable=True),
        sa.Column("description", sa.String(length=4000), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
    )
    op.create_index(op.f("ix_organizations_slug"), "organizations", ["slug"], unique=True)
    op.create_index(op.f("ix_organizations_name"), "organizations", ["name"], unique=False)

    # Backfill organizations from org users
    slug_expr = (
        "lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))"
        if is_pg
        else "lower(name)"
    )
    op.execute(
        sa.text(
            f"""
            INSERT INTO organizations (account_id, name, slug, contact_email, created_at, updated_at)
            SELECT id, name, {slug_expr}, email, created_at, updated_at
            FROM users WHERE role = 'ORG'
            """
        )
    )

    # user_profiles table
    op.create_table(
        "user_profiles",
        sa.Column("account_id", sa.Integer(), sa.ForeignKey("accounts.id"), primary_key=True, nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=True),
        sa.Column("location", profile_location_enum if is_pg else sa.String(length=16), nullable=True),
        sa.Column("persona_type", persona_type_enum if is_pg else sa.String(length=16), nullable=False, server_default="STUDENT"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
    )

    # Backfill user_profiles from non-org users (default persona STUDENT; store full name as first_name)
    if is_pg:
        op.execute(
            sa.text(
                """
                INSERT INTO user_profiles (account_id, first_name, persona_type, created_at, updated_at)
                SELECT id, name, 'STUDENT'::persona_type_enum, created_at, updated_at
                FROM users WHERE role = 'STUDENT'
                """
            )
        )
    else:
        op.execute(
            sa.text(
                """
                INSERT INTO user_profiles (account_id, first_name, persona_type, created_at, updated_at)
                SELECT id, name, 'STUDENT', created_at, updated_at
                FROM users WHERE role = 'STUDENT'
                """
            )
        )

    # Rewire opportunities.org_id FK to organizations(account_id)
    with op.batch_alter_table("opportunities") as batch_op:
        with suppress(Exception):
            # Constraint name may differ on some DBs; try generic drop
            batch_op.drop_constraint("opportunities_org_id_fkey", type_="foreignkey")
        batch_op.create_foreign_key(
            "opportunities_org_id_fkey",
            "organizations",
            ["org_id"],
            ["account_id"],
        )

    # Drop legacy users table and enum/sequence if present (no data assumed)
    # Safe on Postgres; on SQLite table/enum handling is simplified
    with suppress(Exception):
        # Table may have been removed already or not exist
        op.drop_table("users")
    if is_pg:
        # Drop legacy enum and sequence if they exist
        op.execute(sa.text("DROP TYPE IF EXISTS user_role_enum"))
        op.execute(sa.text("DROP SEQUENCE IF EXISTS user_id_seq"))


def downgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    # Restore opportunities FK to users.id
    with op.batch_alter_table("opportunities") as batch_op:
        with suppress(Exception):
            batch_op.drop_constraint("opportunities_org_id_fkey", type_="foreignkey")
        batch_op.create_foreign_key(
            "opportunities_org_id_fkey",
            "users",
            ["org_id"],
            ["id"],
        )

    op.drop_table("user_profiles")
    op.drop_index(op.f("ix_organizations_name"), table_name="organizations")
    op.drop_index(op.f("ix_organizations_slug"), table_name="organizations")
    op.drop_table("organizations")

    op.drop_index(op.f("ix_accounts_email"), table_name="accounts")
    op.drop_table("accounts")

    if is_pg:
        op.execute(sa.text("DROP TYPE IF EXISTS profile_location_enum"))
        op.execute(sa.text("DROP TYPE IF EXISTS persona_type_enum"))
        op.execute(sa.text("DROP TYPE IF EXISTS account_kind_enum"))

    # Recreate legacy users table (structure matching pre-migration schema)
    # Recreate enum for role on Postgres
    if is_pg:
        op.execute(sa.text("CREATE TYPE user_role_enum AS ENUM ('STUDENT','ORG')"))
        role_col = sa.Enum(name="user_role_enum")
    else:
        role_col = sa.String(length=10)
    op.execute(sa.text('CREATE SEQUENCE IF NOT EXISTS user_id_seq'))
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), sa.Sequence("user_id_seq"), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", role_col, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
