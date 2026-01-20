from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Claim(Base):
    __tablename__ = "claims"
    
    claim_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    claim_type = Column(String(100), nullable=False)
    incident_date = Column(Date, nullable=False)
    location = Column(Text, nullable=False)
    amount_requested = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, approved, rejected, paid
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="claims")
    policy = relationship("Policy", back_populates="claims")
    documents = relationship("ClaimDocument", back_populates="claim", cascade="all, delete-orphan")

class ClaimDocument(Base):
    __tablename__ = "claim_documents"
    
    document_id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.claim_id"), nullable=False)
    s3_key = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    claim = relationship("Claim", back_populates="documents")