from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    
    @validator('password')
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes when encoded as UTF-8')
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserRead(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class PolicyBase(BaseModel):
    name: str
    provider: Optional[str] = None
    type: Optional[str] = None
    coverage_amount: Optional[float] = None
    premium: Optional[float] = None
    duration_months: Optional[int] = None

class PolicyOut(PolicyBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Claims Schemas
class ClaimCreate(BaseModel):
    policy_id: int
    claim_type: str
    incident_date: date
    location: str
    amount_requested: float
    description: str

class ClaimStatusUpdate(BaseModel):
    status: str

class ClaimDocumentCreate(BaseModel):
    s3_key: str
    filename: str
    size_bytes: int

class ClaimDocumentOut(BaseModel):
    document_id: int
    claim_id: int
    s3_key: str
    filename: str
    size_bytes: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ClaimOut(BaseModel):
    claim_id: int
    user_id: int
    policy_id: int
    claim_type: str
    incident_date: date
    location: str
    amount_requested: float
    description: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    documents: List[ClaimDocumentOut] = []

    class Config:
        from_attributes = True
