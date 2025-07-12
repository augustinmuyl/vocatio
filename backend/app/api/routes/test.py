from app.db.session import get_session
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.schemas.user_schema import UserCreate

router = APIRouter()


@router.get("/test")
async def test(session: Session = Depends(get_session)):
    results = session.exec(select(1)).first()
    return {"results": results}


@router.post("/register/test")
async def register_test(payload: UserCreate, session: Session = Depends(get_session)):
    print(payload.model_dump())
    return {"message": "User parsed successfully", "data": payload}
