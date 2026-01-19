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
from s3_config import s3_client, AWS_S3_BUCKET
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Header
from models import ClaimDocument

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


security = HTTPBearer()

from fastapi import Request

def get_current_user(
    request: Request,
    token: str = Header(None),
    db: Session = Depends(get_db)
):
    # ✅ Allow preflight requests
    if request.method == "OPTIONS":
        return None

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



def admin_only(
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        return None  # OPTIONS request

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    return current_user



def create_access_token(data: dict, expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES):
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def run_fraud_checks(claim, db):
    flags = []

    # Rule 1: High amount
    if claim.amount > 50000:
        flags.append({
            "rule": "HIGH_AMOUNT",
            "severity": "high",
            "details": "Claim amount exceeds 50,000"
        })

    # Rule 2: Multiple claims in last 7 days
    recent_claims = db.query(models.Claim).filter(
        models.Claim.user_name == claim.user_name,
        models.Claim.created_at >= datetime.utcnow() - timedelta(days=7)
    ).count()

    if recent_claims > 2:
        flags.append({
            "rule": "MULTIPLE_CLAIMS",
            "severity": "medium",
            "details": "Multiple claims in short period"
        })

    return flags

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
        "refresh_token": refresh_token,
        "role": user.role  
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
@app.get("/users/me")
def get_logged_in_user(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.full_name,
        "phone": current_user.phone,
    }

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

    # 🔹 RUN FRAUD CHECKS (Milestone-4)
    fraud_results = run_fraud_checks(new_claim, db)

    for f in fraud_results:
        fraud = models.FraudFlag(
            claim_id=new_claim.id,
            rule_code=f["rule"],
            severity=f["severity"],
            details=f["details"]
        )
        db.add(fraud)

    db.commit()

    # 📧 EMAIL NOTIFICATION
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
        to_email="srivallipulaparthi24@gmail.com",
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
def upload_docs(
    claim_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]

    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_key = f"claims/{claim_id}/{file.filename}"

    # upload to S3
    s3_client.upload_fileobj(
        file.file,
        AWS_S3_BUCKET,
        file_key,
        ExtraArgs={"ContentType": file.content_type}
    )

    # ✅ SAVE TO DATABASE
    doc = models.ClaimDocument(
        claim_id=claim_id,
        filename=file.filename,
        s3_key=file_key
    )
    db.add(doc)
    db.commit()

    return {
        "message": "Document uploaded successfully",
        "filename": file.filename
    }


@app.patch("/admin/claims/{claim_id}/status")
def admin_update_claim_status(
    claim_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_only)
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
        "message": "Claim status updated by admin",
        "claim_id": claim.id,
        "status": claim.status
    }

@app.get("/claims/status/{status}")
def get_claims_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    return db.query(models.Claim).filter(models.Claim.status == status).all()

@app.get("/admin/fraud-flags")
def view_fraud_flags(
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_only)
):
    return db.query(models.FraudFlag).order_by(
        models.FraudFlag.created_at.desc()
    ).all()
@app.get("/admin/claims/{claim_id}")
def get_claim_details(
    claim_id: int,
    db: Session = Depends(get_db)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # fraud flags
    fraud_flags = db.query(models.FraudFlag).filter(
        models.FraudFlag.claim_id == claim_id
    ).all()

    return {
        "claim": claim,
        "fraud_flags": fraud_flags
    }
@app.get("/admin/claims/{claim_id}/documents")
def get_claim_documents(
    claim_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_only)
):
    docs = db.query(models.ClaimDocument).filter(
        models.ClaimDocument.claim_id == claim_id
    ).all()

    results = []
    for doc in docs:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": AWS_S3_BUCKET,
                "Key": doc.s3_key,
            },
            ExpiresIn=3600,  # 1 hour
        )

        results.append({
            "id": doc.id,
            "filename": doc.filename,
            "url": url
        })

    return results

