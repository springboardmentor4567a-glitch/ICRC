from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models.user import User
from app.schemas import UserRead

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user