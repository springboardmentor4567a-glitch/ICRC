from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import re

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

    # --- SANITIZATION ---
    @validator('name')
    def sanitize_name(cls, v):
        # Remove any HTML tags or script injections
        if '<script>' in v or '</script>' in v:
            raise ValueError('Invalid characters in name')
        return v.strip()

    @validator('email')
    def validate_email_format(cls, v):
        # Basic Email Regex
        regex = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$'
        if not re.search(regex, v, re.IGNORECASE):
            raise ValueError('Invalid email format')
        return v

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

class Notification(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClaimCreate(BaseModel):
    purchase_id: int
    incident_type: str
    description: str
    claim_amount: int

    # --- SANITIZATION FOR CLAIMS ---
    @validator('description')
    def sanitize_description(cls, v):
        # Prevent XSS in claim descriptions
        clean_text = re.sub(r'<[^>]*>', '', v)  # Removes HTML tags
        return clean_text

class ClaimResponse(ClaimCreate):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True