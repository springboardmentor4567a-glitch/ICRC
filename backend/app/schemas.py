# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional, Dict, Any

class PolicyOut(BaseModel):
    id: int
    provider_id: int
    title: str
    policy_type: str
    premium: float
    deductible: Optional[float]
    term_months: int
    coverage: Optional[Dict[str, Any]]
    tnc_url: Optional[str]
    provider_name: Optional[str] = None
    class Config:
        orm_mode = True

class CalculateRequest(BaseModel):
    policy_id: int
    age: int
    sum_insured: float
    coverage_options: Optional[Dict[str,bool]] = {}

class CalculateResponse(BaseModel):
    policy_id: int
    base_premium: float
    calculated_premium: float
    breakdown: Dict[str, float]