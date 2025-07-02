from datetime import datetime, timezone
from enum import Enum as PYEnum
from sqlmodel import Column, Enum, SQLModel, Field


class Role(str, PYEnum):
    STUDENT = "STUDENT"
    ORG = "ORG"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str  # need to come back to (display_name, differences between org and student names)
    email: str = Field(..., unique=True, index=True)  # ensure is unique during migrations
    hashed_password: str
    role: Role = Field(
        default=Role.STUDENT, sa_column=Column(Enum(Role, name="user_role_enum"), nullable=False)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    # updated_at
    # last_login
    # email_verified  // for email verification
