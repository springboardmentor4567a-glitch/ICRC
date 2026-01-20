from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas import LoginSchema
from app.models import User, Admin
from app.utils.security import verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(data: LoginSchema):
    db: Session = SessionLocal()

    # ================= ADMIN LOGIN =================
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if admin and verify_password(data.password, admin.password):
        return {"token": "admin-token", "role": "admin"}

    # ================= USER LOGIN =================
    user = db.query(User).filter(User.email == data.email).first()
    if user and verify_password(data.password, user.password):
        return {"token": "user-token", "role": "user"}

    raise HTTPException(status_code=401, detail="Invalid credentials")


