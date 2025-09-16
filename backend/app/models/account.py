from datetime import UTC, datetime
from enum import Enum as PYEnum

from sqlalchemy import Integer, Sequence
from sqlmodel import Column, DateTime, Enum, Field, SQLModel, func


class AccountKind(str, PYEnum):
    USER = "USER"
    ORG = "ORG"


class Account(SQLModel, table=True):
    __tablename__ = "accounts"  # type: ignore[override]

    id: int | None = Field(
        default=None,
        sa_column=Column(Integer, Sequence("account_id_seq"), primary_key=True),
    )
    email: str = Field(max_length=320, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    kind: AccountKind = Field(
        sa_column=Column(Enum(AccountKind, name="account_kind_enum"), nullable=False)
    )
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
        ),
    )
    last_login: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

