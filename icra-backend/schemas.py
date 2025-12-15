from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, List
from fastapi.security import OAuth2PasswordBearer

# This is required for get_current_user to work
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    name: str
    password: str
    dob: date
    otp: Optional[str] = None

class UserLogin(UserBase):
    password: str

class EmailRequest(BaseModel):
    email: EmailStr

class UserResponse(UserBase):
    id: int
    name: str
    message: str = "Success"
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

# --- POLICY SCHEMAS ---
class PolicyBase(BaseModel):
    category: str
    policy_name: str
    provider: str
    premium: int
    cover_amount: int
    description: str
    features: str

class PolicyCreate(PolicyBase):
    pass

class PolicyResponse(PolicyBase):
    id: int
    class Config:
        from_attributes = True

# --- MY POLICY SCHEMA (New for My Policies Page) ---
class MyPolicyResponse(BaseModel):
    id: int
    purchase_date: date
    status: str
    policy: PolicyResponse # Nested policy details
    
    class Config:
        from_attributes = True