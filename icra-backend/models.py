from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

# 1. User Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    dob = Column(Date)
    
    # Relationship: One User has Many Policies
    policies = relationship("UserPolicy", back_populates="user")

# 2. Policy Table
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)      # e.g., "Health", "Auto"
    policy_name = Column(String, index=True)
    provider = Column(String, index=True)
    premium = Column(Integer)
    cover_amount = Column(Integer)
    description = Column(Text)
    features = Column(Text)

# 3. UserPolicy Table (The Link / Purchase Record)
class UserPolicy(Base):
    __tablename__ = "userpolicies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))
    purchase_date = Column(Date, default=datetime.date.today)
    status = Column(String, default="Active") # Active, Expired

    user = relationship("User", back_populates="policies")
    policy = relationship("Policy")