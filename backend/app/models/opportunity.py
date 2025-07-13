from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class Opportunity(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="user.id")
    title: str  # limit length in schema
    description: str  # ^^^
    community_hours: int
    event_date: datetime

    address: str
    city: str
    state: str
    zip_code: str

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )  # remember to update in routes
    is_active: bool = Field(default=True)
