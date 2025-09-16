from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session, select

from app.db.session import get_session

router = APIRouter()


@router.get("/test")
def test(session: Session = Depends(get_session)):
    results = session.exec(select(1)).first()
    return {"results": results}


class RegisterTestPayload(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)


@router.post("/register/test")
def register_test(payload: RegisterTestPayload, session: Session = Depends(get_session)):
    print(payload.model_dump())
    return {"message": "User parsed successfully", "data": payload}
