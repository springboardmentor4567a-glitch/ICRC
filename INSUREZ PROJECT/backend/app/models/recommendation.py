from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))
    score = Column(DECIMAL)
    rationale = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())