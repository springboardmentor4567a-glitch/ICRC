from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    password = Column(String)
    dob = Column(DateTime)
    risk_profile = Column(JSON, default={}) # Stores: {income, smoker, vehicle, etc}

    # Relationships
    policies = relationship("UserPolicy", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String) # Health, Life, Auto, etc.
    provider = Column(String)
    policy_name = Column(String)
    premium = Column(Integer)
    cover_amount = Column(Integer)
    description = Column(String)
    features = Column(String) # Stored as "Feature1;Feature2;Feature3"

class UserPolicy(Base):
    __tablename__ = "user_policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))
    purchase_date = Column(DateTime, default=func.now())
    status = Column(String, default="Active")

    user = relationship("User", back_populates="policies")
    policy = relationship("Policy")

# --- THIS IS THE MISSING PART CAUSING THE ERROR ---
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))
    score = Column(Integer)
    reason = Column(String)

    user = relationship("User", back_populates="recommendations")
    policy = relationship("Policy")