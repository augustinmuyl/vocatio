from datetime import UTC, datetime

from sqlalchemy import String
from sqlmodel import Column, DateTime, Field, SQLModel, func


class Organization(SQLModel, table=True):
    __tablename__ = "organizations"  # type: ignore[override]

    # Shared primary key referencing accounts.id
    account_id: int = Field(primary_key=True, foreign_key="accounts.id")

    name: str = Field(max_length=200)
    slug: str = Field(
        max_length=100,
        sa_column=Column(String(100), nullable=False, unique=True, index=True),
    )

    contact_email: str | None = Field(default=None, max_length=320)
    contact_phone: str | None = Field(default=None, max_length=32)
    logo_url: str | None = Field(default=None, max_length=2048)
    description: str | None = Field(default=None, max_length=4000)

    is_verified: bool = Field(default=False, index=True)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
        ),
    )
