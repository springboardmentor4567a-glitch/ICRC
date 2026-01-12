from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from datetime import datetime


class RegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    confirm: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    class Config:
        orm_mode = True

# Provider / Policy Schemas
class ProviderOut(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    class Config:
        orm_mode = True

class PolicyOut(BaseModel):
    id: int
    provider_id: int
    name: str
    policy_number: Optional[str] = None
    category: Optional[str] = None
    coverage: Optional[str] = None
    premium: Optional[float] = None
    benefits: Optional[str] = None
    provider: Optional[ProviderOut] = None
    class Config:
        orm_mode = True

class UserPreferences(BaseModel):
    age: int
    gender: str
    smoker: bool
    marital_status: str
    policy_type: str
    annual_income: str
    dependents: int
    pre_existing_conditions: bool
from datetime import date

class ClaimCreate(BaseModel):
    user_name: str
    policy_number: str
    claim_type: str
    incident_date: date
    amount: float
    reason: str

class ClaimOut(BaseModel):
    id: int
    user_name: str
    policy_number: str
    claim_type: str
    incident_date: date
    amount: float
    reason: str
    status: str
    created_at: datetime
    email_sent: bool = False   # ✅ ADD THIS

    class Config:
        from_attributes = True
