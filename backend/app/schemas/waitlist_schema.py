from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

from app.models.waitlist import WaitlistRole


class WaitlistCreate(BaseModel):
    role: WaitlistRole
    name: str = Field(..., max_length=100)
    email: EmailStr = Field(..., max_length=320)
    additional_info: str | None = None
    consent: Literal[True]
    website: str | None = None


class WaitlistRead(BaseModel):
    id: int
    role: WaitlistRole
    name: str
    email: EmailStr
    additional_info: str | None = None
    consent: bool
    created_at: datetime

    model_config = {"from_attributes": True}
