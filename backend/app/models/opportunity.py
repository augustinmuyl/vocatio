from datetime import UTC, datetime

from sqlmodel import Column, DateTime, Field, SQLModel, func


class Opportunity(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="user.id")
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
