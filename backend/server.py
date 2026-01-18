# server.py
import hashlib
from datetime import datetime, timedelta
from typing import List
import os, shutil
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from jose import jwt
from fastapi import UploadFile, File, Form, Header
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import csv
from fastapi.responses import FileResponse
import os

# -------------------------------------------------
# CONFIG
# -------------------------------------------------
SECRET_KEY = "supersecretdevkey"
ALGORITHM = "HS256"

DATABASE_URL = "sqlite:///./infosys_db.sqlite3"

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
print("SMTP_EMAIL =", SMTP_EMAIL)
print("SMTP_PASSWORD =", "SET" if SMTP_PASSWORD else None)


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
    is_admin = Column(Integer, default=0)   # 0 = user, 1 = admin
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

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    policy_id = Column(Integer)
    description = Column(String)
    document_url = Column(String)
    status = Column(String, default="Submitted")
    created_at = Column(DateTime, default=datetime.utcnow)
class FraudFlag(Base):
    __tablename__ = "fraud_flags"
    id = Column(Integer, primary_key=True)
    claim_id = Column(Integer)
    rule_code = Column(String)
    severity = Column(String)
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer)
    action = Column(String)
    target_type = Column(String)
    target_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
class UserPolicy(Base):
    __tablename__ = "user_policies"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    policy_id = Column(Integer)
    policy_number = Column(String)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    status = Column(String, default="active")
  
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

class ClaimIn(BaseModel):
    policy_id: int
    description: str


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

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

        print(f"📧 Email sent to {to_email}")
    except Exception as e:
        print("❌ Email sending failed:", e)
def get_user_email(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    return user.email if user else None

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
# -------- ADD ADMIN CREATION API HERE --------

@app.post("/create-admin")
def create_admin(db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.email == "admin@admin.com").first()

    if admin:
        return {"message": "Admin already exists"}

    new_admin = User(
        name="Admin",
        email="admin@admin.com",
        password=hash_password("admin123"),
        is_admin=1
    )

    db.add(new_admin)
    db.commit()

    return {"message": "Admin account created"}

@app.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(401, "Invalid credentials")

    return {
        "user": {
   "id": user.id,
        "name": user.name,
        "is_admin": user.is_admin
  }
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

        # Policy type match
        if p.policy_type == pref.policy_type:
            score += 40
            reasons.append("Matches policy type")
        else:
            score -= 20

        # Risk handling
        if pref.risk_level == "High":
            if p.deductible <= 1000:
                score += 30
                reasons.append("Low deductible suits high risk")
            else:
                score -= 10
        elif pref.risk_level == "Medium":
            if p.deductible <= 2000:
                score += 15
                reasons.append("Balanced deductible for medium risk")
        else:  # Low risk
            if p.deductible > 1000:
                score += 10
                reasons.append("Higher deductible acceptable for low risk")

        # Location handling
        if pref.location == "Metro":
            score += 20
            reasons.append("Metro coverage")
        elif pref.location == "Rural":
            score -= 10
            reasons.append("Limited rural coverage")

        score = max(score, 0)

        db.add(Recommendation(
            user_id=user_id,
            policy_id=p.id,
            score=score,
            reason=", ".join(reasons)
        ))

        results.append({
            "policy": p.title,
            "score": score,
            "risk_level": pref.risk_level,
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
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# S3-LIKE PUBLIC FILE ACCESS ROUTE
from fastapi.staticfiles import StaticFiles
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

# -------------------------------------------------
# CLAIMS (Week 5 & 6)
# -------------------------------------------------
@app.post("/claims")
async def create_claim(
    policy_id: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(None),
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    file_url = None

    if file:
        filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
        path = os.path.join(UPLOAD_DIR, filename)

        with open(path, "wb") as f:
            f.write(await file.read())

        # CREATE S3-LIKE PUBLIC URL
        file_url = f"http://127.0.0.1:8000/files/{filename}"

    claim = Claim(
        user_id=user_id,
        policy_id=policy_id,
        description=description,
        document_url=file_url,
        status="Submitted"
    )

    db.add(claim)
    db.commit()

    db.refresh(claim)

    # Create notification for admin when new claim is submitted
    admins = db.query(User).filter(User.is_admin == 1).all()

    for admin in admins:
        admin_note = Notification(
            user_id=admin.id,
            message=f"New claim #{claim.id} submitted by user {user_id}"
        )
        db.add(admin_note)

    db.commit()


    if admin:
        admin_note = Notification(
            user_id=admin.id,
            message=f"New claim #{claim.id} submitted by user {user_id}"
        )
        db.add(admin_note)
        db.commit()

    run_fraud_checks(db, claim)

    email = get_user_email(db, user_id)
    if email:
        send_email(
            email,
            "Claim Submitted",
            f"Your claim #{claim.id} has been submitted successfully."
        )

    return {"message": "Claim submitted successfully"}

@app.get("/claims")
def get_claims(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    return db.query(Claim).filter(Claim.user_id == user_id).all()

@app.get("/admin/claims")
def get_all_claims(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.is_admin != 1:
        raise HTTPException(403, "Admin access required")

    return db.query(Claim).all()

@app.put("/claims/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    status: str,
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    print("🔥 ADMIN ID RECEIVED:", user_id)
    print("🔥 CLAIM ID:", claim_id)
    print("🔥 STATUS:", status)
    claim = db.query(Claim).filter(Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(404, "Claim not found")

    # Update status
    claim.status = status
    db.commit()

    # Notification to user
    note = Notification(
        user_id=claim.user_id,
        message=f"Your claim #{claim.id} is now {status}"
    )
    db.add(note)

    # ADMIN LOG ENTRY  🔥🔥
    log = AdminLog(
        admin_id=user_id,
        action=f"Changed claim status to {status}",
        target_type="Claim",
        target_id=claim.id
    )

    db.add(log)
    db.commit()

    # Send Email
    email = get_user_email(db, claim.user_id)
    if email:
        send_email(
            email,
            "Claim Status Updated",
            f"Your claim #{claim.id} status is now: {status}"
        )

    return {"message": f"Status updated to {status}"}

@app.get("/notifications/count")
def get_notification_count(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    count = db.query(Notification)\
        .filter(Notification.user_id == user_id)\
        .filter(Notification.is_read == 0)\
        .count()

    return {"count": count}

@app.get("/notifications")
def get_notifications(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    return db.query(Notification)\
        .filter(Notification.user_id == user_id)\
        .order_by(Notification.created_at.desc())\
        .all()


def run_fraud_checks(db: Session, claim: Claim):

    recent = db.query(Claim).filter(
        Claim.user_id == claim.user_id,
        Claim.created_at > datetime.utcnow() - timedelta(days=1)
    ).count()

    admin = db.query(User).filter(User.is_admin == 1).first()

    # ---------- RULE 1: TOO MANY CLAIMS ----------
    if recent > 3:
        db.add(FraudFlag(
            claim_id=claim.id,
            rule_code="TOO_MANY_CLAIMS",
            severity="medium",
            details="User submitted more than 3 claims in 24 hours"
        ))

        # Notify Admin
        if admin:
            db.add(Notification(
                user_id=admin.id,
                message=f"⚠ Fraud Alert: Claim #{claim.id} – Too many claims by user {claim.user_id} in 24 hours"
            ))

        # Notify User
        db.add(Notification(
            user_id=claim.user_id,
            message=f"Your claim #{claim.id} is under review due to unusual activity"
        ))

    # ---------- RULE 2: DUPLICATE DOCUMENT ----------
    if claim.document_url:
        dup = db.query(Claim).filter(
            Claim.document_url == claim.document_url,
            Claim.id != claim.id
        ).first()

        if dup:
            db.add(FraudFlag(
                claim_id=claim.id,
                rule_code="DUPLICATE_DOCUMENT",
                severity="high",
                details="Same document used in another claim"
            ))

            # Notify Admin
            if admin:
                db.add(Notification(
                    user_id=admin.id,
                    message=f"⚠ Fraud Alert: Claim #{claim.id} – Duplicate document detected"
                ))

            # Notify User
            db.add(Notification(
                user_id=claim.user_id,
                message=f"Your claim #{claim.id} is under verification due to duplicate document"
            ))

    db.commit()

@app.post("/user/policies/{policy_id}")
def enroll_policy(
    policy_id: int,
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    # Check if already enrolled
    existing = db.query(UserPolicy).filter(
        UserPolicy.user_id == user_id,
        UserPolicy.policy_id == policy_id
    ).first()

    if existing:
        raise HTTPException(400, "Policy already enrolled")

    policy = db.query(Policy).filter(Policy.id == policy_id).first()

    if not policy:
        raise HTTPException(404, "Policy not found")

    end = datetime.utcnow() + timedelta(days=policy.term_months * 30)

    new_policy = UserPolicy(
        user_id=user_id,
        policy_id=policy_id,
        policy_number=f"POL{user_id}{policy_id}{int(datetime.utcnow().timestamp())}",
        end_date=end
    )

    db.add(new_policy)
    db.commit()

    return {"message": "Policy enrolled successfully"}

@app.get("/user/policies")
def get_my_policies(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    return db.query(UserPolicy).filter(UserPolicy.user_id == user_id).all()
@app.get("/admin/user-policies")
def admin_view_policies(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.is_admin != 1:
        raise HTTPException(403, "Admin access required")

    return db.query(UserPolicy).all()
@app.get("/admin/analytics")
def admin_analytics(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.is_admin != 1:
        raise HTTPException(403, "Admin access required")

    total_claims = db.query(Claim).count()
    approved = db.query(Claim).filter(Claim.status == "Approved").count()
    rejected = db.query(Claim).filter(Claim.status == "Rejected").count()
    fraud = db.query(FraudFlag).count()
    users = db.query(User).count()
    policies = db.query(UserPolicy).count()

    return {
        "total_claims": total_claims,
        "approved_claims": approved,
        "rejected_claims": rejected,
        "fraud_flags": fraud,
        "total_users": users,
        "total_user_policies": policies
    }
@app.get("/admin/export/claims")
def export_claims(
    user_id: int = Header(..., alias="user-id"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.is_admin != 1:
        raise HTTPException(403, "Admin access required")

    claims = db.query(Claim).all()

    file_path = "claims_report.csv"

    with open(file_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "User ID", "Policy ID", "Status", "Created At"])

        for c in claims:
            writer.writerow([
                c.id,
                c.user_id,
                c.policy_id,
                c.status,
                c.created_at
            ])

    return FileResponse(file_path, filename="claims_report.csv")
