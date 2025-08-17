from datetime import UTC, datetime
from typing import ClassVar

from sqlalchemy import Integer, Sequence
from sqlmodel import Column, DateTime, Field, SQLModel, func


class Opportunity(SQLModel, table=True):
    __tablename__ = "opportunities"  # type: ignore[override]

    id: int | None = Field(
        default=None,
        sa_column=Column(Integer, Sequence("opportunity_id_seq"), primary_key=True),
    )
    org_id: int = Field(foreign_key="users.id")
    title: str = Field(max_length=200)
    description: str = Field(max_length=1000)
    community_hours: int
    event_date: datetime

    address: str = Field(max_length=200)
    city: str = Field(max_length=100)
    state: str = Field(max_length=100)
    zip_code: str = Field(max_length=10)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )  # remember to update in routes
    is_active: bool = Field(default=True)
