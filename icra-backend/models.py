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
    
    role = Column(String, default="user")
    risk_profile = Column(JSON, default={})
    last_login = Column(DateTime, default=datetime.datetime.utcnow)

    policies = relationship("UserPolicy", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    admin_logs = relationship("AdminLog", back_populates="admin")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    provider = Column(String)
    policy_name = Column(String)
    premium = Column(Integer)
    cover_amount = Column(Integer)
    description = Column(String)
    features = Column(String)

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
    type = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("user_policies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    incident_type = Column(String)
    description = Column(String)
    claim_amount = Column(Integer)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    purchase = relationship("UserPolicy", back_populates="claims")

class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    rule_code = Column(String)
    severity = Column(String)
    details = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim")

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    target_type = Column(String)
    target_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    admin = relationship("User", back_populates="admin_logs")