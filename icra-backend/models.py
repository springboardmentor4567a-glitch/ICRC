from sqlalchemy import Column, Integer, String, Date, JSON, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    risk_profile = Column(JSON, default={}) 
    created_at = Column(TIMESTAMP, server_default=func.now())