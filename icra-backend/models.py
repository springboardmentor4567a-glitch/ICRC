from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime, func
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    password = Column(String)
    dob = Column(DateTime)
<<<<<<< HEAD
    
    # --- NEW COLUMN ---
    role = Column(String, default="user") # 'user' or 'admin'
    
    risk_profile = Column(JSON, default={}) # Stores: {income, smoker, vehicle, etc}
    
    # --- ADD THIS NEW FIELD ---
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
=======
    risk_profile = Column(JSON, default={}) # Stores: {income, smoker, vehicle, etc}
>>>>>>> d3f807c35cd56039ec5d0b697a32adf89bb718d7

    # Relationships
    policies = relationship("UserPolicy", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

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
    claims = relationship("Claim", back_populates="purchase")

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

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String) # 'success', 'warning', 'info'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("user_policies.id")) # Link to the specific policy bought
    user_id = Column(Integer, ForeignKey("users.id"))
    incident_type = Column(String) # e.g., "Accident", "Hospitalization"
    description = Column(String)
    claim_amount = Column(Integer)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

<<<<<<< HEAD
    purchase = relationship("UserPolicy", back_populates="claims")

# --- MILESTONE 4: FRAUD & ADMIN MODELS ---
# Add these to the bottom of models.py

class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    rule_code = Column(String)  # e.g., "F01_QUICK_CLAIM"
    severity = Column(String)   # "High", "Medium", "Low"
    details = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship
    claim = relationship("Claim")

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)      # e.g., "APPROVED_CLAIM"
    target_id = Column(Integer)  # ID of the claim/policy affected
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
=======
    purchase = relationship("UserPolicy", back_populates="claims")
>>>>>>> d3f807c35cd56039ec5d0b697a32adf89bb718d7
