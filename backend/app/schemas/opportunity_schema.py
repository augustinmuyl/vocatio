from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.models.opportunity import Location, Theme


class OpportunityCreate(BaseModel):
    org_id: UUID
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=4000)
    community_hours: int | None = Field(default=None, ge=1, le=1000)

    start_at: datetime
    end_at: datetime
    timezone: str = Field(default="America/New_York", max_length=64)

    location: Location
    address: str | None = Field(default=None, max_length=200)
    zip_code: str | None = Field(default=None, pattern=r"^\d{5}(-\d{4})?$")

    themes: list[Theme] | None = None
    signup_url: str | None = Field(default=None, max_length=2048)

    is_active: bool = Field(default=True)

    @model_validator(mode="after")
    def validate_fields(self):
        if self.location != Location.REMOTE and not self.address:
            raise ValueError("address is required for non-REMOTE locations")
        if self.end_at <= self.start_at:
            raise ValueError("end_at must be after start_at")
        return self


class OpportunityRead(BaseModel):
    id: UUID
    org_id: UUID
    title: str
    description: str
    community_hours: int | None
    slug: str

    start_at: datetime
    end_at: datetime
    timezone: str

    location: Location
    address: str | None
    zip_code: str | None

    themes: list[Theme] | None
    signup_url: str | None

    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class OpportunityUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    community_hours: int | None = Field(default=None, ge=1, le=1000)

    start_at: datetime | None = None
    end_at: datetime | None = None
    timezone: str | None = Field(default=None, max_length=64)

    location: Location | None = None
    address: str | None = Field(default=None, max_length=200)
    zip_code: str | None = Field(default=None, pattern=r"^\d{5}(-\d{4})?$")

    themes: list[Theme] | None = None
    signup_url: str | None = Field(default=None, max_length=2048)

    is_active: bool | None = None
