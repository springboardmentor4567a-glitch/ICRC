from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.schemas import SignupSchema
from app.utils.security import hash_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(data: SignupSchema):
    db: Session = SessionLocal()

    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)  # ✅ HASHED
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {"message": "Signup successful"}
