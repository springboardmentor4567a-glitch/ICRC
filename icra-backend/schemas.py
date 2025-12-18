from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- PROFILE SCHEMA ---
class RiskProfileUpdate(BaseModel):
    # Old Fields
    annual_income: Optional[str] = None
    marital_status: Optional[str] = None
    dependents: Optional[str] = None
    occupation: Optional[str] = None
    city: Optional[str] = None
    smoker: Optional[bool] = False
    vehicle_type: Optional[str] = None
    
    # NEW FIELDS (Added for Enhanced Profile)
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    alcohol: Optional[str] = None
    medical_history: Optional[List[str]] = [] # Accepts a list of strings
    existing_loans: Optional[str] = None
    retirement_age: Optional[str] = None
    vehicle_age: Optional[str] = None
    home_ownership: Optional[str] = None
    top_priority: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    risk_profile: Optional[dict] = {}
    
    class Config:
        from_attributes = True  # Fixes the object-to-dict conversion error

# --- 2. AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    dob: Optional[datetime] = None
    otp: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class EmailRequest(BaseModel):
    email: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse  # <--- CHANGED from 'dict' to 'UserResponse' to fix the error!

# --- 3. POLICY SCHEMAS ---
class PolicyResponse(BaseModel):
    id: int
    category: str
    provider: str
    policy_name: str
    premium: int
    cover_amount: int
    description: str
    features: str
    
    class Config:
        from_attributes = True

class MyPolicyResponse(BaseModel):
    id: int
    status: str
    purchase_date: datetime # Keeps exact time to avoid date errors
    policy: PolicyResponse
    
    class Config:
        from_attributes = True