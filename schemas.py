from pydantic import BaseModel
from datetime import datetime

# ===============================
# AUTH SCHEMAS
# ===============================
class SignupSchema(BaseModel):
    name: str
    email: str
    password: str


class LoginSchema(BaseModel):
    email: str
    password: str


# ===============================
# POLICY SCHEMAS
# ===============================
class PolicyOut(BaseModel):
    id: int
    policy_name: str
    coverage_amount: float

    class Config:
        from_attributes = True


# ===============================
# CLAIM SCHEMAS
# ===============================
class ClaimCreate(BaseModel):
    policy_id: int
    claim_amount: float
    reason: str


class ClaimOut(BaseModel):
    id: int
    policy_id: int
    claim_amount: float
    reason: str
    document_path: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True



class AdminLogin(BaseModel):
    email: str
    password: str