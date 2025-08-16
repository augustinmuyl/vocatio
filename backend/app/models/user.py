from datetime import UTC, datetime
from enum import Enum as PYEnum

from sqlalchemy import Integer, Sequence
from sqlmodel import Column, DateTime, Enum, Field, SQLModel, func


class Role(str, PYEnum):
    STUDENT = "STUDENT"
    ORG = "ORG"


class User(SQLModel, table=True):
    id: int | None = Field(
        default=None,
        sa_column=Column(Integer, Sequence("user_id_seq"), primary_key=True),
    )
    name: str = Field(
        max_length=100
    )  # need to come back to (display_name, differences between org and student names)
    email: str = Field(
        ..., unique=True, index=True, max_length=320
    )  # ensure is unique during migrations
    hashed_password: str = Field(max_length=255)
    role: Role = Field(
        default=Role.STUDENT, sa_column=Column(Enum(Role, name="user_role_enum"), nullable=False)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )  # remember to update in routes
    is_active: bool = Field(default=True)
    # updated_at
    # last_login
    # email_verified  // for email verification
