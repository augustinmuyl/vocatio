from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.user import Role


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)  # not hashed
    role: Role


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    is_active: bool

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
