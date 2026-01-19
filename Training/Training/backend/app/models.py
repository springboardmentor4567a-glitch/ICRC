from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    mobile = Column(String(50), nullable=True)
    username = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Notification preferences
    notify_claim_updates = Column(Boolean, default=True)
    notify_policy_updates = Column(Boolean, default=True)
    notify_promotions = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    claims = relationship("Claim", back_populates="user")
    recommendations = relationship("PolicyRecommendation", back_populates="user")


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(255), nullable=False)
    policy_type = Column(String(100), nullable=False)  # Health, Auto, Home, Life
    provider = Column(String(255), nullable=False)
    coverage_amount = Column(Float, nullable=False)
    premium_monthly = Column(Float, nullable=False)
    premium_yearly = Column(Float, nullable=False)
    deductible = Column(Float, nullable=False)
    features = Column(Text, nullable=True)  # JSON string of features
    rating = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    claim_number = Column(String(50), unique=True, nullable=False)
    policy_type = Column(String(100), nullable=False)
    claim_type = Column(String(100), nullable=False)
    claim_amount = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    incident_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="Submitted")  # Submitted, Under Review, Approved, Rejected, Paid
    documents = Column(Text, nullable=True)  # JSON string of document paths
    fraud_score = Column(Float, default=0.0)
    fraud_flags = Column(Text, nullable=True)  # JSON string of fraud indicators
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="claims")
    history = relationship("ClaimHistory", back_populates="claim")


class ClaimHistory(Base):
    __tablename__ = "claim_history"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    claim = relationship("Claim", back_populates="history")


class UserPolicy(Base):
    __tablename__ = "user_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("insurance_policies.id"), nullable=False)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="Active")
    
    user = relationship("User")
    policy = relationship("InsurancePolicy")


class PolicyRecommendation(Base):
    __tablename__ = "policy_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("insurance_policies.id"), nullable=False)
    recommendation_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
    policy = relationship("InsurancePolicy")
