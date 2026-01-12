import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Header,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from fastapi import UploadFile, File
from utils.email import send_email


import database
import models
import schemas
from database import SessionLocal

load_dotenv()

SECRET_KEY = "your_secret_key_here"    # change later & keep safe
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30       # Token expires in 30 mins
REFRESH_TOKEN_EXPIRE_DAYS = 7          # Refresh token valid for 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


models.Base.metadata.create_all(bind=database.engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
def get_current_user(
    token: str = Header(None),
    db: Session = Depends(get_db)
):
    if token is None:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user



def create_access_token(data: dict, expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES):
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


# ---------------- Register ---------------- #

@app.post("/register")
def register(payload: schemas.RegisterIn, db: Session = Depends(get_db)):
    if payload.password != payload.confirm:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=pwd_context.hash(payload.password),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"message": "Registered Successfully", "email": user.email}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")


# ---------------- Login ---------------- #

@app.post("/login")
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"email": user.email})
    refresh_token = create_refresh_token({"email": user.email})

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "refresh_token": refresh_token
    }


# ---------------- Protected Home Route ---------------- #

@app.get("/home")
def home(token: str = Header(None)):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"message": "Welcome 🏠", "email": decoded["email"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")


# ---------------- Refresh Token Route ---------------- #

@app.post("/refresh")
def refresh(refresh_token: str = Header(None)):
    try:
        decoded = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        new_access_token = create_access_token({"email": decoded["email"]})
        return {"access_token": new_access_token}
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
@app.get("/providers", response_model=list[schemas.ProviderOut])
def list_providers(db: Session = Depends(get_db)):
    providers = db.query(models.Provider).all()
    return providers

# Get all policies (optionally filtered by category or provider)
@app.get("/policies", response_model=list[schemas.PolicyOut])
def list_policies(category: str | None = None, provider_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Policy)
    if category:
        q = q.filter(models.Policy.category == category)
    if provider_id:
        q = q.filter(models.Policy.provider_id == provider_id)
    return q.order_by(models.Policy.premium).all()

# Get single policy
@app.get("/policies/{policy_id}", response_model=schemas.PolicyOut)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    return p
@app.post("/users/me/preferences")
def save_preferences(
    prefs: schemas.UserPreferences,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.risk_profile = prefs.dict()
    db.commit()
    db.refresh(current_user)

    return {"message": "User preferences saved successfully"}
@app.get("/users/me/preferences")
def get_preferences(
    current_user: models.User = Depends(get_current_user)
):
    return current_user.risk_profile
@app.post("/claims", response_model=schemas.ClaimOut)
def create_claim(
    claim: schemas.ClaimCreate,
    db: Session = Depends(get_db)
):
    new_claim = models.Claim(
        user_name=claim.user_name,
        policy_number=claim.policy_number,
        claim_type=claim.claim_type,
        incident_date=claim.incident_date,
        amount=claim.amount,
        reason=claim.reason,
        status="submitted"
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    # 📧 EMAIL NOTIFICATION (FIXED)
    email_body = f"""
Hello {new_claim.user_name},

Your insurance claim has been submitted successfully.

Claim ID: {new_claim.id}
Policy Number: {new_claim.policy_number}
Claim Type: {new_claim.claim_type}
Amount: ₹{new_claim.amount}
Status: {new_claim.status}


We will notify you once the status changes.

Thank you,
Insurance Claim Assistant Team
"""

    send_email(
        to_email="srivallipulaparthi24@gmail.com",  # replace with user email later
        subject="Claim Submitted Successfully",
        body=email_body
    )

    return {
    "id": new_claim.id,
    "user_name": new_claim.user_name,
    "policy_number": new_claim.policy_number,
    "claim_type": new_claim.claim_type,
    "incident_date": new_claim.incident_date,
    "amount": new_claim.amount,
    "reason": new_claim.reason,
    "status": new_claim.status,
    "created_at": new_claim.created_at,
    "email_sent": True
}



@app.get("/claims", response_model=list[schemas.ClaimOut])
def list_claims(db: Session = Depends(get_db)):
    return db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()

@app.post("/claims/{claim_id}/documents")
def upload_docs(claim_id: int, file: UploadFile = File(...)):
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]

    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    contents = file.file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")

    return {
        "claim_id": claim_id,
        "filename": file.filename,
        "status": "uploaded"
    }
@app.patch("/claims/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if status not in ["submitted", "in_progress", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    claim.status = status
    db.commit()
    db.refresh(claim)

    return {
        "message": "Claim status updated",
        "claim_id": claim.id,
        "status": claim.status
    }
@app.get("/claims/status/{status}")
def get_claims_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    return db.query(models.Claim).filter(models.Claim.status == status).all()

