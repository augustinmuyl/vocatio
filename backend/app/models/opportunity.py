from datetime import UTC, datetime
from enum import Enum as PYEnum

from sqlalchemy import JSON, CheckConstraint, Integer, Sequence, String
from sqlmodel import Column, DateTime, Enum, Field, SQLModel, func


class Location(str, PYEnum):
    NYC = "NYC"
    MIAMI = "MIAMI"
    OTHER = "OTHER"
    REMOTE = "REMOTE"


class Theme(str, PYEnum):
    COMMUNITY_SERVICE = "COMMUNITY_SERVICE"
    ENVIRONMENT = "ENVIRONMENT"
    EDUCATION = "EDUCATION"
    HEALTH = "HEALTH"
    ARTS = "ARTS"
    STEM = "STEM"
    SPORTS = "SPORTS"
    ADVOCACY = "ADVOCACY"


class Opportunity(SQLModel, table=True):
    __tablename__ = "opportunities"  # type: ignore[override]
    __table_args__ = (
        CheckConstraint("end_at > start_at", name="ck_opportunity_end_after_start"),
        CheckConstraint(
            "(location = 'REMOTE' OR address IS NOT NULL)",
            name="ck_opportunity_address_required",
        ),
    )

    id: int | None = Field(
        default=None,
        sa_column=Column(Integer, Sequence("opportunity_id_seq"), primary_key=True),
    )
    # Link to organizations via their shared primary key (account_id)
    org_id: int = Field(foreign_key="organizations.account_id", index=True)
    title: str = Field(max_length=200)
    description: str = Field(max_length=4000)
    community_hours: int | None = None

    # Slug for human-friendly links; keep unique
    slug: str = Field(
        max_length=100,
        sa_column=Column(String(100), nullable=False, unique=True, index=True),
    )

    # Event timing
    start_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, index=True)
    )
    end_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    timezone: str = Field(
        default="America/New_York",
        max_length=64,
        sa_column=Column(String(64), nullable=False),
    )

    # Location and address
    location: Location = Field(
        sa_column=Column(
            Enum(Location, name="opportunity_location_enum"), nullable=False, index=True
        )
    )
    address: str | None = Field(default=None, max_length=200)
    zip_code: str | None = Field(default=None, max_length=10)

    # Themes for filtering (portable: JSON array of enum labels)
    themes: list[Theme] | None = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
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
    is_active: bool = Field(default=True, index=True)

    # Optional signup URL for applications/RSVP
    signup_url: str | None = Field(
        default=None,
        max_length=2048,
        sa_column=Column(String(2048), nullable=True),
    )
