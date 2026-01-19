from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from database import Base
from datetime import datetime



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
     # ✅ Week 3 addition
    risk_profile = Column(JSONB, nullable=True)
    role = Column(String, default="user")
class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)   # short code e.g. "LIC"
    logo = Column(String, nullable=True)   # optional path or URL to logo
    description = Column(Text, nullable=True)

    policies = relationship("Policy", back_populates="provider")

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    name = Column(String, nullable=False)
    policy_number = Column(String, nullable=True, unique=True)
    category = Column(String, nullable=True)   # e.g., Life / Health / Vehicle
    coverage = Column(String, nullable=True)   # short text e.g., "5 Lakh"
    premium = Column(Float, nullable=True)     # numeric premium (yearly)
    benefits = Column(Text, nullable=True)
    terms_conditions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    provider = relationship("Provider", back_populates="policies")
class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    policy_number = Column(String, nullable=False)
    claim_type = Column(String, nullable=False)
    incident_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="submitted")
    created_at = Column(DateTime, default=datetime.utcnow)
class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    rule_code = Column(String)
    severity = Column(String)  # low, medium, high
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
class ClaimDocument(Base):
    __tablename__ = "claim_documents"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    filename = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
