from sqlalchemy import Column, Integer, String, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    provider = Column(String(100))
    type = Column(String(50))
    coverage_amount = Column(DECIMAL)
    premium = Column(DECIMAL)
    duration_months = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    claims = relationship("Claim", back_populates="policy")