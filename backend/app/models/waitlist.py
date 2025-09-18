from datetime import UTC, datetime
from enum import Enum as PYEnum
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Column, DateTime, Enum, Text, UniqueConstraint, Uuid
from sqlmodel import Field, SQLModel, func


class WaitlistRole(str, PYEnum):
    STUDENT = "student"
    PARENT = "parent"
    ORGANIZATION = "organization"
    OTHER = "other"


class WaitlistEntry(SQLModel, table=True):
    __tablename__ = "waitlist_entries"  # type: ignore[override]
    __table_args__ = (UniqueConstraint("email", name="uq_waitlist_email"),)

    id: UUID | None = Field(
        default_factory=uuid4,
        sa_column=Column(Uuid(as_uuid=True), primary_key=True, nullable=False),
    )
    role: WaitlistRole = Field(
        sa_column=Column(
            Enum(
                WaitlistRole,
                name="waitlist_role_enum",
                values_callable=lambda e: [m.value for m in e],
            ),
            nullable=False,
        )
    )
    name: str = Field(max_length=100)
    email: str = Field(max_length=320)
    additional_info: str | None = Field(
        default=None,
        sa_column=Column(Text, nullable=True),
    )
    consent: bool = Field(
        sa_column=Column(Boolean, nullable=False),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
