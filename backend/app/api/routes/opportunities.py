from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from fastapi import APIRouter, Depends, HTTPException, Query

from app.db.session import get_session
from app.models.opportunity import Location, Opportunity, Theme
from app.models.organization import Organization
from app.schemas.opportunity_schema import (
    OpportunityCreate,
    OpportunityListItem,
    OpportunityListResponse,
    OpportunityOrganization,
    OpportunityRead,
)
from app.services.opportunity_service import (
    OrganizationLookupError,
    build_description_preview,
    create_opportunity as create_opportunity_service,
    get_opportunity_by_slug,
    list_opportunities,
)

if TYPE_CHECKING:
    from sqlmodel import Session
else:
    Session = Any

router = APIRouter()


def _build_opportunity_response(
    session: Session, opportunity: Opportunity
) -> OpportunityRead:
    org = session.get(Organization, opportunity.org_id)
    organization = (
        OpportunityOrganization(
            id=org.account_id,
            name=org.name,
            slug=org.slug,
            contact_email=org.contact_email,
            contact_phone=org.contact_phone,
            logo_url=org.logo_url,
        )
        if org
        else None
    )
    base = OpportunityRead.model_validate(opportunity, from_attributes=True)
    return base.model_copy(update={"organization": organization})


@router.post("/opportunities", response_model=OpportunityRead)
def create_opportunity(
    payload: OpportunityCreate, session: Session = Depends(get_session)
):
    try:
        opportunity = create_opportunity_service(session, payload)
    except OrganizationLookupError:
        raise HTTPException(status_code=404, detail="Organization not found") from None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _build_opportunity_response(session, opportunity)


@router.get("/opportunities/{opportunity_id}", response_model=OpportunityRead)
def read_opportunity(
    opportunity_id: uuid.UUID, session: Session = Depends(get_session)
):
    opportunity_uuid = uuid.UUID(str(opportunity_id))
    opportunity = session.get(Opportunity, opportunity_uuid)
    if not opportunity or not opportunity.is_active:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _build_opportunity_response(session, opportunity)


@router.get("/opportunities", response_model=OpportunityListResponse)
def list_opportunities_route(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    search: str | None = Query(default=None),
    locations: list[Location] | None = Query(default=None),
    themes: list[Theme] | None = Query(default=None),
    sort_by: str = Query(default="updated_at"),
    sort_direction: str = Query(default="desc"),
    session: Session = Depends(get_session),
):
    try:
        items, total = list_opportunities(
            session,
            page=page,
            page_size=page_size,
            search=search,
            locations=locations,
            themes=themes,
            sort_by=sort_by,
            sort_direction=sort_direction,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    response_items: list[OpportunityListItem] = []
    for item in items:
        model = OpportunityListItem.model_validate(item, from_attributes=True)
        model = model.model_copy(
            update={"preview": build_description_preview(item.description)}
        )
        response_items.append(model)

    has_next = page * page_size < total
    return OpportunityListResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=has_next,
    )


@router.get("/opportunities/slug/{slug}", response_model=OpportunityRead)
def read_opportunity_by_slug(
    slug: str, session: Session = Depends(get_session)
):
    opportunity = get_opportunity_by_slug(session, slug)
    if not opportunity or not opportunity.is_active:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _build_opportunity_response(session, opportunity)
