import re
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.opportunity import Location, Opportunity
from app.schemas.opportunity_schema import OpportunityCreate, OpportunityRead

router = APIRouter()


def _slugify(title: str) -> str:
    s = title.strip().lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s[:80]


@router.post("/opportunities", response_model=OpportunityRead)
def create_opportunity(payload: OpportunityCreate, session: Session = Depends(get_session)):
    data = payload.model_dump()

    # derive community_hours if not provided (floor to full hours)
    if data.get("community_hours") is None:
        delta: timedelta = data["end_at"] - data["start_at"]
        hours = int(delta.total_seconds() // 3600)
        data["community_hours"] = max(hours, 0)

    # enforce address for non-REMOTE (defense-in-depth)
    if data["location"] != Location.REMOTE and not data.get("address"):
        raise HTTPException(status_code=400, detail="address is required for non-REMOTE locations")

    # generate slug and ensure uniqueness
    base_slug = _slugify(data["title"]) or "opportunity"
    slug = base_slug
    i = 1
    while session.exec(select(Opportunity).where(Opportunity.slug == slug)).first():
        slug = f"{base_slug}-{i}"
        i += 1
    data["slug"] = slug

    opportunity = Opportunity(**data)
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
