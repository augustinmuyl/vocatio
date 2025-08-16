from datetime import datetime

from pydantic import BaseModel, Field


class OpportunityCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=1000)
    community_hours: int = Field(..., ge=1, le=1000)
    event_date: datetime

    address: str
    city: str
    state: str
    zip_code: str = Field(..., pattern=r"^\d{5}(-\d{4})?$")

    is_active: bool = Field(default=True)  # give orgs the option to keep as drafts


class OpportunityRead(BaseModel):
    id: int
    org_id: int
    title: str
    description: str
    community_hours: int
    event_date: datetime

    address: str
    city: str
    state: str
    zip_code: str

    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class OpportunityUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    community_hours: int | None = Field(default=None, ge=1, le=1000)
    event_date: datetime | None = None

    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = Field(default=None, pattern=r"^\d{5}(-\d{4})?$")

    is_active: bool | None = None
