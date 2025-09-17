from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.opportunity import Opportunity
from app.schemas.opportunity_schema import OpportunityCreate, OpportunityRead
from app.services.opportunity_service import (
    OrganizationLookupError,
    create_opportunity as create_opportunity_service,
)

router = APIRouter()


@router.post("/opportunities", response_model=OpportunityRead)
def create_opportunity(payload: OpportunityCreate, session: Session = Depends(get_session)):
    try:
        opportunity = create_opportunity_service(session, payload)
    except OrganizationLookupError:
        raise HTTPException(status_code=404, detail="Organization not found") from None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return opportunity


@router.get("/opportunities/{opportunity_id}", response_model=OpportunityRead)
def read_opportunity(opportunity_id: UUID, session: Session = Depends(get_session)):
    opportunity = session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity
