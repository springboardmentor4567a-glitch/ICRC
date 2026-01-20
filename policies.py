from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Policies
from ..schemas import PolicyOut
from typing import List

router = APIRouter(prefix="/policies", tags=["Policies"])

@router.get("/", response_model=List[PolicyOut])
def get_policies(db: Session = Depends(get_db)):
    return db.query(Policies).all()
