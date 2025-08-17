from datetime import UTC, datetime
from enum import Enum as PYEnum

from sqlalchemy import Column, DateTime, Enum, Integer, Sequence, Text, UniqueConstraint
from sqlmodel import Field, SQLModel, func


class WaitlistRole(str, PYEnum):
    STUDENT = "student"
    PARENT = "parent"
    ORGANIZATION = "organization"
    OTHER = "other"


class Requirement(str, PYEnum):
    GRADUATION = "graduation"
    BRIGHT_FUTURES = "bright_futures"
    HONOR_CORD = "honor_cord"
    OTHER = "other"


class WaitlistEntry(SQLModel, table=True):
    __tablename__ = "waitlist_entries"
    __table_args__ = (
        UniqueConstraint("email", "role", name="uq_waitlist_email_role"),
    )

    id: int | None = Field(
        default=None,
        sa_column=Column(
            Integer,
            Sequence("waitlist_entry_id_seq"),
            primary_key=True,
        ),
    )
    role: WaitlistRole = Field(
        sa_column=Column(
            Enum(WaitlistRole, name="waitlist_role_enum"),
            nullable=False,
        )
    )
    name: str = Field(max_length=100)
    email: str = Field(max_length=320)
    school: str | None = Field(default=None, max_length=200)
    requirement: Requirement | None = Field(
        default=None,
        sa_column=Column(
            Enum(Requirement, name="waitlist_requirement_enum"),
            nullable=True,
        ),
    )
    hours_needed: int | None = Field(default=None)
    org_name: str | None = Field(default=None, max_length=200)
    org_role: str | None = Field(default=None, max_length=100)
    org_opportunities: str | None = Field(
        default=None,
        sa_column=Column(Text, nullable=True),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
