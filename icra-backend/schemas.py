from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, Dict, Any

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

# NEW: Schema for Risk Profile Data
class RiskProfileUpdate(BaseModel):
    marital_status: str
    dependents: int
    annual_income: int
    debt: int
    health_conditions: list[str] = []
    smoker: bool
    vehicle_type: str = "None"
    own_house: bool

class UserResponse(UserBase):
    id: int
    name: str
    # NEW: Return the profile so frontend knows if it's filled
    risk_profile: Optional[Dict[str, Any]] = None
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

class PolicyResponse(PolicyBase):
    id: int
    class Config:
        from_attributes = True

class MyPolicyResponse(BaseModel):
    id: int
    purchase_date: date
    status: str
    policy: PolicyResponse
    class Config:
        from_attributes = True