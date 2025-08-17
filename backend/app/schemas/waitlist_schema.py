from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.waitlist import Requirement, WaitlistRole


class WaitlistCreate(BaseModel):
    role: WaitlistRole
    name: str = Field(..., max_length=100)
    email: EmailStr = Field(..., max_length=320)
    school: str | None = Field(default=None, max_length=200)
    requirement: Requirement | None = None
    hours_needed: int | None = None
    org_name: str | None = Field(default=None, max_length=200)
    org_role: str | None = Field(default=None, max_length=100)
    org_opportunities: str | None = None


class WaitlistRead(BaseModel):
    id: int
    role: WaitlistRole
    name: str
    email: EmailStr
    school: str | None = None
    requirement: Requirement | None = None
    hours_needed: int | None = None
    org_name: str | None = None
    org_role: str | None = None
    org_opportunities: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
