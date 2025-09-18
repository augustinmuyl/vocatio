from datetime import UTC, datetime
from enum import Enum as PYEnum
from uuid import UUID

from sqlalchemy import ForeignKey, Uuid
from sqlmodel import Column, DateTime, Enum, Field, SQLModel, func


class PersonaType(str, PYEnum):
    STUDENT = "STUDENT"
    PARENT = "PARENT"
    OTHER = "OTHER"


class ProfileLocation(str, PYEnum):
    NYC = "NYC"
    MIAMI = "MIAMI"
    OTHER = "OTHER"


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"  # type: ignore[override]

    # Shared primary key referencing accounts.id
    account_id: UUID = Field(
        sa_column=Column(
            Uuid(as_uuid=True), ForeignKey("accounts.id"), primary_key=True
        )
    )
    first_name: str = Field(max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    location: ProfileLocation | None = Field(
        default=None,
        sa_column=Column(Enum(ProfileLocation, name="profile_location_enum"), nullable=True),
    )
    persona_type: PersonaType = Field(
        sa_column=Column(Enum(PersonaType, name="persona_type_enum"), nullable=False)
    )
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
