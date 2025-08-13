from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.user import Role


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)  # not hashed
    role: Role = Role.STUDENT


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    is_active: bool
    created_at = datetime
    updated_at = datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
