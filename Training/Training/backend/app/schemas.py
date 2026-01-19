from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    username: Optional[str] = None
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: Optional[str]
    mobile: Optional[str]
    username: Optional[str]
    email: EmailStr
    is_active: bool

    class Config:
        orm_mode = True


# Insurance Policy Schemas
class PolicyBase(BaseModel):
    policy_name: str
    policy_type: str
    provider: str
    coverage_amount: float
    premium_monthly: float
    premium_yearly: float
    deductible: float
    features: Optional[str] = None
    rating: Optional[float] = 0.0
    description: Optional[str] = None

class PolicyCreate(PolicyBase):
    pass

class PolicyOut(PolicyBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True


# Premium Calculator Schemas
class PremiumCalculatorRequest(BaseModel):
    policy_type: str  # Health, Auto, Home, Life
    age: int
    coverage_amount: float
    deductible: float
    location: Optional[str] = None
    risk_factors: Optional[List[str]] = []
    
class PremiumCalculatorResponse(BaseModel):
    monthly_premium: float
    yearly_premium: float
    coverage_amount: float
    deductible: float
    factors_considered: List[str]


# Claim Schemas
class ClaimCreate(BaseModel):
    policy_type: str
    claim_type: str
    claim_amount: float
    description: str
    incident_date: datetime
    documents: Optional[List[str]] = []

class ClaimOut(BaseModel):
    id: int
    user_id: int
    claim_number: str
    policy_type: str
    claim_type: str
    claim_amount: float
    description: str
    incident_date: datetime
    status: str
    documents: Optional[str] = None
    fraud_score: float
    fraud_flags: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# Claim History Schemas
class ClaimHistoryOut(BaseModel):
    id: int
    claim_id: int
    status: str
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True


# Policy Recommendation Schemas
class RecommendationRequest(BaseModel):
    policy_type: str
    age: int
    budget: float
    coverage_needs: List[str]
    existing_policies: Optional[List[str]] = []

class RecommendationOut(BaseModel):
    id: int
    policy: PolicyOut
    recommendation_score: float
    reason: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True


# Fraud Detection Response
class FraudAnalysis(BaseModel):
    fraud_score: float
    risk_level: str  # Low, Medium, High
    flags: List[str]
    details: str
