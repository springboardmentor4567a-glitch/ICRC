from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from app.database import Base
from datetime import datetime


class Policies(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True)
    policy_name = Column(String, nullable=False)
    coverage_amount = Column(Float, nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)   # ✅ ADD THIS
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)



class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)     # ✅ REQUIRED
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True)
    policy_id = Column(Integer, ForeignKey("policies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    claim_amount = Column(Float, nullable=False)
    reason = Column(String)
    document_path = Column(String)
    status = Column(String, default="Submitted")
    created_at = Column(DateTime, default=datetime.utcnow)
