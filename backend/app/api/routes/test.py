from app.db.session import get_session
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

router = APIRouter()


@router.get("/test")
async def test(session: Session = Depends(get_session)):
    results = session.exec(select(1)).first()
    return {"results": results}
