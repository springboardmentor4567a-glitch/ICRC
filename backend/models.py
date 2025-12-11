from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)

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
    created_at = Column(DateTime, default=datetime.utcnow)

    provider = relationship("Provider", back_populates="policies")
