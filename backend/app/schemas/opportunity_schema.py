from datetime import datetime
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, Field, field_validator, model_validator

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

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("timezone must be a valid IANA zone string") from exc
        return value


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

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str | None) -> str | None:
        if value is None:
            return value
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("timezone must be a valid IANA zone string") from exc
        return value

    @model_validator(mode="after")
    def validate_fields(self):
        fields_set = self.model_fields_set

        if "start_at" in fields_set and self.start_at is None:
            raise ValueError("start_at cannot be null")
        if "end_at" in fields_set and self.end_at is None:
            raise ValueError("end_at cannot be null")
        if "timezone" in fields_set and self.timezone is None:
            raise ValueError("timezone cannot be null")

        if self.start_at and self.end_at and self.end_at <= self.start_at:
            raise ValueError("end_at must be after start_at")

        if (
            self.location is not None
            and self.location != Location.REMOTE
            and "address" in fields_set
            and not self.address
        ):
            raise ValueError("address is required for non-REMOTE locations")

        return self


class OpportunityListItem(BaseModel):
    id: UUID
    org_id: UUID
    title: str
    slug: str
    start_at: datetime
    end_at: datetime
    timezone: str
    location: Location
    themes: list[Theme] | None
    community_hours: int | None
    signup_url: str | None
    created_at: datetime
    updated_at: datetime
    preview: str = ""

    model_config = {"from_attributes": True}


class OpportunityListResponse(BaseModel):
    items: list[OpportunityListItem]
    total: int
    page: int
    page_size: int
    has_next: bool
