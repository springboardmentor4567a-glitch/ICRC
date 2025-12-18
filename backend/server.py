# server.py
import hashlib
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from jose import jwt

# -------------------------------------------------
# CONFIG
# -------------------------------------------------
SECRET_KEY = "supersecretdevkey"
ALGORITHM = "HS256"

DATABASE_URL = "sqlite:///./infosys_db.sqlite3"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# -------------------------------------------------
# DATABASE MODELS
# -------------------------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    country = Column(String)


class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True)
    provider_id = Column(Integer)
    policy_type = Column(String)
    title = Column(String)
    premium = Column(Integer)
    term_months = Column(Integer)
    deductible = Column(Integer)


class UserPreference(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    age = Column(Integer)
    policy_type = Column(String)
    risk_level = Column(String)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    policy_id = Column(Integer)
    score = Column(Integer)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

# -------------------------------------------------
# SCHEMAS
# -------------------------------------------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class PreferenceIn(BaseModel):
    age: int
    policy_type: str
    risk_level: str
    location: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

# -------------------------------------------------
# UTILS
# -------------------------------------------------
def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str):
    return hash_password(password) == hashed

# -------------------------------------------------
# APP SETUP
# -------------------------------------------------
app = FastAPI(title="Infosys Insurance Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------
# SEED DATA
# -------------------------------------------------
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if not db.query(Policy).first():
        p1 = Provider(name="Star Health", country="India")
        p2 = Provider(name="LIC", country="India")
        db.add_all([p1, p2])
        db.commit()

        db.add_all([
            Policy(provider_id=1, policy_type="Health", title="Health Plus", premium=5000, term_months=12, deductible=1000),
            Policy(provider_id=2, policy_type="Life", title="Life Secure", premium=8000, term_months=24, deductible=2000),
            Policy(provider_id=1, policy_type="Auto", title="Auto Shield", premium=3000, term_months=12, deductible=500),
        ])
        db.commit()
    db.close()

# -------------------------------------------------
# AUTH
# -------------------------------------------------
@app.post("/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already exists")

    db.add(User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password)
    ))
    db.commit()
    return {"message": "Registered successfully"}


@app.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(401, "Invalid credentials")

    return {
        "user": {"id": user.id, "name": user.name}
    }

# -------------------------------------------------
# POLICIES
# -------------------------------------------------
@app.get("/policies")
def get_policies(db: Session = Depends(get_db)):
    return db.query(Policy).all()

# -------------------------------------------------
# WEEK 3 – SAVE PREFERENCES
# -------------------------------------------------
@app.post("/preferences")
def save_preferences(
    payload: PreferenceIn,
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    db.add(UserPreference(
        user_id=user_id,
        age=payload.age,
        policy_type=payload.policy_type,
        risk_level=payload.risk_level,
        location=payload.location
    ))
    db.commit()
    return {"message": "Preferences saved"}

# -------------------------------------------------
# WEEK 4 – RECOMMENDATIONS
# -------------------------------------------------
@app.get("/recommendations")
def get_recommendations(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference)\
        .filter(UserPreference.user_id == user_id)\
        .order_by(UserPreference.created_at.desc())\
        .first()

    if not pref:
        return []

    db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()

    results = []
    for p in db.query(Policy).all():
        score = 0
        reasons = []

        if p.policy_type == pref.policy_type:
            score += 40
            reasons.append("Matches policy type")

        if pref.risk_level == "High" and p.deductible <= 1000:
            score += 30
            reasons.append("Low deductible")

        if pref.location == "Metro":
            score += 20
            reasons.append("Metro coverage")

        db.add(Recommendation(
            user_id=user_id,
            policy_id=p.id,
            score=score,
            reason=", ".join(reasons)
        ))

        results.append({
            "policy": p.title,
            "score": score,
            "reason": ", ".join(reasons)
        })

    db.commit()
    return sorted(results, key=lambda x: x["score"], reverse=True)

# -------------------------------------------------
# USERS
# -------------------------------------------------
@app.get("/users", response_model=List[UserOut])
def users(db: Session = Depends(get_db)):
    return db.query(User).all()
