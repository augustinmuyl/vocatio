from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserRead

router = APIRouter()


@router.post("/users", response_model=UserRead)
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=payload.password,
        role=payload.role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/users/{user_id}", response_model=UserRead)
def read_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

