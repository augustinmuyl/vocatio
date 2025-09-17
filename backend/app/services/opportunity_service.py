"""Shared opportunity business logic used by both API and CLI entry points."""

from __future__ import annotations

import re
from collections.abc import MutableSet
from datetime import timedelta
from uuid import UUID

from sqlmodel import Session, select

from app.models.opportunity import Location, Opportunity
from app.models.organization import Organization
from app.schemas.opportunity_schema import OpportunityCreate


class OrganizationLookupError(Exception):
    """Raised when an organization identifier cannot be resolved."""

    def __init__(self, identifier: str) -> None:
        super().__init__(f"Organization not found for identifier: {identifier}")
        self.identifier = identifier


def slugify_title(title: str) -> str:
    """Create a URL-friendly slug stem from a title."""

    s = title.strip().lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s[:80]


def _ensure_org(session: Session, org_id: UUID) -> None:
    if not session.get(Organization, org_id):
        raise OrganizationLookupError(str(org_id))


def _derive_hours(payload: OpportunityCreate) -> int:
    delta: timedelta = payload.end_at - payload.start_at
    hours = int(delta.total_seconds() // 3600)
    return max(hours, 0)


def _resolve_slug(
    session: Session,
    title: str,
    reserved_slugs: MutableSet[str] | None = None,
) -> str:
    base_slug = slugify_title(title) or "opportunity"
    slug = base_slug
    i = 1

    # keep checking until slug is unique across DB and current batch
    while True:
        slug_taken = session.exec(
            select(Opportunity).where(Opportunity.slug == slug)
        ).first()
        if not slug_taken and (reserved_slugs is None or slug not in reserved_slugs):
            break
        slug = f"{base_slug}-{i}"
        i += 1

    if reserved_slugs is not None:
        reserved_slugs.add(slug)
    return slug


def create_opportunity(
    session: Session,
    payload: OpportunityCreate,
    *,
    reserved_slugs: MutableSet[str] | None = None,
    commit: bool = True,
    refresh: bool = True,
) -> Opportunity:
    """Persist an opportunity, handling derived fields and slug generation."""

    _ensure_org(session, payload.org_id)

    data = payload.model_dump()

    if data.get("community_hours") is None:
        data["community_hours"] = _derive_hours(payload)

    if data["location"] != Location.REMOTE and not data.get("address"):
        # Should be enforced by Pydantic, but kept for defense-in-depth when
        # payloads originate outside FastAPI.
        raise ValueError("address is required for non-REMOTE locations")

    data["slug"] = _resolve_slug(session, data["title"], reserved_slugs)

    opportunity = Opportunity(**data)
    session.add(opportunity)

    if commit:
        session.commit()
        if refresh:
            session.refresh(opportunity)

    return opportunity

