from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.core.email import send_confirmation_email
from app.db.session import get_session
from app.models.waitlist import WaitlistEntry
from app.schemas.waitlist_schema import WaitlistCreate

router = APIRouter()


@router.post("/waitlist")
def create_waitlist_entry(
    payload: WaitlistCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    entry = WaitlistEntry(**payload.model_dump())
    session.add(entry)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=409, detail="Email already registered for this role"
        ) from exc
    session.refresh(entry)
    background_tasks.add_task(send_confirmation_email, entry.email, entry.name)
    return {"message": "Waitlist entry created"}
