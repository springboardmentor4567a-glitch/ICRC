from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import os
from datetime import datetime, timedelta
from backend.models import db, User

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        if token.startswith('Bearer '):
            token = token[7:]
        payload = jwt.decode(token, os.getenv("SECRET_KEY", "demo-secret"), algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token is invalid")

def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/login")
async def login(request: LoginRequest):
    try:
        email = request.email
        password = request.password

        # Simple mock authentication for demo
        if email == "admin@admin.com" and password == "admin":
            # Generate JWT token (no expiration for demo)
            token_payload = {
                "user_id": 1,
                "email": email,
                "role": "admin"
            }
            access_token = jwt.encode(token_payload, os.getenv("SECRET_KEY", "demo-secret"), algorithm="HS256")

            return {
                "message": "Login Successful",
                "accessToken": access_token,
                "user": {
                    "id": 1,
                    "email": email,
                    "name": "Admin User",
                    "role": "admin"
                }
            }
        elif email and password:
            # Generate JWT token (no expiration for demo)
            token_payload = {
                "user_id": 2,
                "email": email,
                "role": "user"
            }
            access_token = jwt.encode(token_payload, os.getenv("SECRET_KEY", "demo-secret"), algorithm="HS256")

            return {
                "message": "Login Successful",
                "accessToken": access_token,
                "user": {
                    "id": 2,
                    "email": email,
                    "name": "Regular User",
                    "role": "user"
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
