from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.policy import Policy
from app.schemas import PolicyOut
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/policies", tags=["policies"])

@router.get("/", response_model=list[PolicyOut])
def list_policies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Policy).all()
