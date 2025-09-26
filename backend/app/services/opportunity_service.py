"""Shared opportunity business logic used by both API and CLI entry points."""

from __future__ import annotations

import re
import unicodedata
from typing import TYPE_CHECKING

from sqlalchemy import cast, func, or_
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Session, select

from app.models.opportunity import Location, Opportunity, Theme
from app.models.organization import Organization

if TYPE_CHECKING:
    from collections.abc import MutableSet, Sequence
    from datetime import datetime, timedelta
    from uuid import UUID

    from app.schemas.opportunity_schema import OpportunityCreate, OpportunityUpdate

try:  # pragma: no cover - optional dependency path
    import regex as _regex
except ModuleNotFoundError:  # pragma: no cover - fallback path
    _regex = None


_ELLIPSIS = "\u2026"
_ZWJ = "\u200d"
_VARIATION_SELECTORS = {0xFE0E, 0xFE0F}


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


def _normalize_datetimes(start_at: datetime, end_at: datetime) -> tuple[datetime, datetime]:
    if start_at.tzinfo is None and end_at.tzinfo is not None:
        start_at = start_at.replace(tzinfo=end_at.tzinfo)
    elif start_at.tzinfo is not None and end_at.tzinfo is None:
        end_at = end_at.replace(tzinfo=start_at.tzinfo)
    return start_at, end_at


def _calculate_hours(start_at: datetime, end_at: datetime) -> int:
    start_aligned, end_aligned = _normalize_datetimes(start_at, end_at)
    delta: timedelta = end_aligned - start_aligned
    hours = int(delta.total_seconds() // 3600)
    return max(hours, 1)


def _derive_hours(payload: OpportunityCreate) -> int:
    return _calculate_hours(payload.start_at, payload.end_at)


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


def update_opportunity(
    session: Session,
    opportunity: Opportunity,
    payload: OpportunityUpdate,
    *,
    commit: bool = True,
    refresh: bool = True,
) -> Opportunity:
    """Apply updates while keeping derived fields and invariants consistent."""

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return opportunity

    start_at = data.get("start_at", opportunity.start_at)
    end_at = data.get("end_at", opportunity.end_at)

    start_check, end_check = _normalize_datetimes(start_at, end_at)

    if end_check <= start_check:
        raise ValueError("end_at must be after start_at")

    location = data.get("location", opportunity.location)
    address = data.get("address", opportunity.address)

    if location != Location.REMOTE and not address:
        raise ValueError("address is required for non-REMOTE locations")

    if "community_hours" not in data:
        data["community_hours"] = _calculate_hours(start_check, end_check)

    for field, value in data.items():
        setattr(opportunity, field, value)

    if commit:
        session.add(opportunity)
        session.commit()
        if refresh:
            session.refresh(opportunity)

    return opportunity


def list_opportunities(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: str | None = None,
    locations: Sequence[Location] | None = None,
    themes: Sequence[Theme] | None = None,
    sort_by: str = "updated_at",
    sort_direction: str = "desc",
) -> tuple[list[Opportunity], int]:
    """Return paginated opportunities with optional filters."""

    filters = [Opportunity.is_active.is_(True)]

    if locations:
        filters.append(Opportunity.location.in_(list(locations)))

    if themes:
        bind = session.get_bind()
        is_postgres = bind is not None and bind.dialect.name == "postgresql"
        themes_column = cast(Opportunity.themes, JSONB) if is_postgres else Opportunity.themes
        theme_filters = [themes_column.contains([theme.value]) for theme in themes]
        if theme_filters:
            if len(theme_filters) == 1:
                filters.append(theme_filters[0])
            else:
                filters.append(or_(*theme_filters))

    if search:
        trimmed = search.strip()
        if trimmed:
            pattern = f"%{trimmed.lower()}%"
            filters.append(
                or_(
                    func.lower(Opportunity.title).like(pattern),
                    func.lower(Opportunity.description).like(pattern),
                )
            )

    allowed_sorts = {"updated_at", "created_at"}
    if sort_by not in allowed_sorts:
        raise ValueError(f"sort_by must be one of {sorted(allowed_sorts)}")

    sort_column = getattr(Opportunity, sort_by)
    sort_desc = sort_direction.lower() != "asc"

    offset = (page - 1) * page_size

    count_stmt = select(func.count()).select_from(Opportunity).where(*filters)
    total = session.exec(count_stmt).one()

    order_clauses = [sort_column.desc() if sort_desc else sort_column.asc()]
    if sort_desc:
        order_clauses.append(Opportunity.id.desc())
    else:
        order_clauses.append(Opportunity.id.asc())

    stmt = (
        select(Opportunity)
        .where(*filters)
        .order_by(*order_clauses)
        .offset(offset)
        .limit(page_size)
    )

    items = session.exec(stmt).all()
    return items, int(total)


def get_opportunity_by_slug(session: Session, slug: str) -> Opportunity | None:
    statement = select(Opportunity).where(Opportunity.slug == slug)
    return session.exec(statement).first()


def build_description_preview(description: str, *, limit: int = 140) -> str:
    """Collapse whitespace, truncate to limit, and append an ellipsis when shortened."""

    collapsed = re.sub(r"\s+", " ", description).strip()
    if not collapsed:
        return ""

    if len(collapsed) <= limit:
        return collapsed

    boundary = collapsed.rfind(" ", 0, limit + 1)
    if boundary > 0:
        truncated = collapsed[:boundary].rstrip()
        if truncated:
            return f"{truncated}{_ELLIPSIS}"

    truncated = _truncate_graphemes(collapsed, limit)
    if not truncated:
        truncated = collapsed[:limit].rstrip()

    return f"{truncated}{_ELLIPSIS}"


def _truncate_graphemes(text: str, limit: int) -> str:
    result: list[str] = []
    total_length = 0
    for cluster in _grapheme_clusters(text):
        cluster_length = len(cluster)
        if total_length + cluster_length > limit:
            break
        result.append(cluster)
        total_length += cluster_length

    return "".join(result).rstrip()


def _grapheme_clusters(text: str) -> list[str]:
    if _regex is not None:  # pragma: no cover - exercised when regex is installed
        return _regex.findall(r"\X", text)

    clusters: list[str] = []
    cluster = ""

    for char in text:
        if not cluster:
            cluster = char
            continue

        codepoint = ord(char)
        if unicodedata.combining(char) or codepoint in _VARIATION_SELECTORS:
            cluster += char
            continue

        if cluster.endswith(_ZWJ):
            cluster += char
            continue

        if char == _ZWJ:
            cluster += char
            continue

        clusters.append(cluster)
        cluster = char

    if cluster:
        clusters.append(cluster)

    return clusters
