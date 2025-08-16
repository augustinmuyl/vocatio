from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.opportunity import Opportunity
from app.schemas.opportunity_schema import OpportunityCreate, OpportunityRead

router = APIRouter()


@router.post("/opportunities", response_model=OpportunityRead)
def create_opportunity(payload: OpportunityCreate, session: Session = Depends(get_session)):
    opportunity = Opportunity(**payload.model_dump())
    session.add(opportunity)
    session.commit()
    session.refresh(opportunity)
    return opportunity


@router.get("/opportunities/{opportunity_id}", response_model=OpportunityRead)
def read_opportunity(opportunity_id: int, session: Session = Depends(get_session)):
    opportunity = session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity

