from sqlalchemy.orm import joinedload
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import List, Optional
import models, schemas, database
import recommendations
import fraud_engine
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import os
import re
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# 1. Load Environment Variables
load_dotenv()

# --- CONFIGURATION ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = 7

# --- EMAIL CONFIGURATION ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("MAIL_USERNAME")
SENDER_PASSWORD = os.getenv("MAIL_PASSWORD")

app = FastAPI(title="ICRA API")

# INITIALIZE RATE LIMITER
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Setup Database
models.Base.metadata.create_all(bind=database.engine)

# --- HELPER: Convert cover string to integer ---
def convert_cover_to_amount(cover_str):
    """Convert cover string like '50 Lakhs', '1 Crore' to integer amount"""
    cover_str = cover_str.lower().strip()
    if "crore" in cover_str or "crores" in cover_str:
        num = float(cover_str.split()[0]) * 10000000  # 1 crore = 10 million
    elif "lakh" in cover_str or "lakhs" in cover_str:
        num = float(cover_str.split()[0]) * 100000  # 1 lakh = 100,000
    elif "$" in cover_str:
        # Convert USD to INR (approx 80 INR per USD)
        num = float(cover_str.replace("$", "").replace(",", "")) * 80
    else:
        # Default fallback
        num = 500000
    return int(num)

# --- SEED DATA FUNCTION (MASSIVE GENERATOR) ---
def seed_policies(db: Session):
    # Check if data exists. If we have less than 10, let's re-seed to get 100+
    if db.query(models.Policy).count() > 10:
        return 

    print("🌱 Generating 100+ Policies for the Marketplace...")

    # --- DATA POOLS ---
    providers = ["Tata AIA", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Star Health", "Max Life", "SBI General", "Acko", "Niva Bupa", "Aditya Birla", "Reliance General", "Digit"]
    
    life_names = ["Sampoorna Raksha", "iSelect Smart", "Life Goal", "Protect Plus", "Mega Life", "Future Secure", "Term Shield", "Family First", "Legacy Plan", "Elite Term"]
    health_names = ["Optima Restore", "Health Companion", "Active Health", "MediClassic", "Super Top-up", "Health Infinity", "Criticare", "Family Floater", "Gold Health", "Platinum Guard"]
    auto_names = ["Car Protect 360", "Drive Assure", "Go Digit Car", "Smart Drive", "Bumper-to-Bumper", "Zero Dep Shield", "Engine Protect", "Roadside Master", "Auto Secure", "Ride Safe"]
    travel_names = ["Travel Elite", "Globe Trotter", "Student Guard", "Asia Gold", "Schengen Secure", "Business Travel", "Voyage Safe", "Trip Protect"]

    categories = ["Life", "Health", "Auto", "Travel", "Business"]
    
    new_policies = []

    # --- 1. GENERATE LIFE INSURANCE (30 Plans) ---
    for i in range(30):
        prov = random.choice(providers)
        name = f"{random.choice(life_names)} {random.choice(['Plus', 'Pro', 'Max', 'Gold', 'Premium'])}"
        premium = random.randint(8000, 35000)
        cover = random.choice(["50 Lakhs", "75 Lakhs", "1 Crore", "2 Crores", "5 Crores"])
        cover_amount = convert_cover_to_amount(cover)
        
        new_policies.append(models.Policy(
            policy_name=name, provider=prov, category="Life", premium=premium, cover_amount=cover_amount,
            description="Comprehensive term life cover with high claim settlement ratio.",
            features="Whole Life Option; Terminal Illness Cover; Tax Benefits"
        ))

    # --- 2. GENERATE HEALTH INSURANCE (40 Plans) ---
    for i in range(40):
        prov = random.choice(providers)
        name = f"{random.choice(health_names)} {random.choice(['Titanium', 'Platinum', 'Silver', 'Family', 'Individual'])}"
        premium = random.randint(5000, 25000)
        cover = random.choice(["3 Lakhs", "5 Lakhs", "10 Lakhs", "25 Lakhs", "1 Crore"])
        cover_amount = convert_cover_to_amount(cover)
        
        new_policies.append(models.Policy(
            policy_name=name, provider=prov, category="Health", premium=premium, cover_amount=cover_amount,
            description="Complete health protection including cashless hospitalization.",
            features="No Room Rent Capping; Restore Benefit; Free Health Checkup"
        ))

    # --- 3. GENERATE AUTO INSURANCE (30 Plans) ---
    for i in range(30):
        prov = random.choice(providers)
        name = f"{random.choice(auto_names)} {random.choice(['Comprehensive', 'Third Party', 'Zero Dep'])}"
        premium = random.randint(2000, 15000)
        # Generate IDV between 2-15 lakhs
        idv_lakhs = random.randint(2, 15)
        cover_amount = idv_lakhs * 100000  # Convert lakhs to amount
        
        new_policies.append(models.Policy(
            policy_name=name, provider=prov, category="Auto", premium=premium, cover_amount=cover_amount,
            description="Protect your vehicle against accidents, theft, and damages.",
            features="24x7 RSA; Engine Protection; Zero Depreciation"
        ))

    # --- 4. GENERATE TRAVEL/BUSINESS (15 Plans) ---
    for i in range(15):
        cat = random.choice(["Travel", "Business"])
        prov = random.choice(providers)
        base_name = random.choice(travel_names) if cat == "Travel" else "SME Protect"
        name = f"{base_name} {random.choice(['Global', 'Domestic', 'Corporate'])}"
        premium = random.randint(1000, 8000)
        cover = "$50,000" if cat == "Travel" else "10 Lakhs"
        cover_amount = convert_cover_to_amount(cover)

        new_policies.append(models.Policy(
            policy_name=name, provider=prov, category=cat, premium=premium, cover_amount=cover_amount,
            description=f"Specialized {cat.lower()} insurance for total peace of mind.",
            features="Instant Policy; Covid-19 Cover; Minimal Documentation"
        ))

    # Add all to DB
    for p in new_policies:
        db.add(p)
    
    db.commit()
    print(f"✅ Database Populated with {len(new_policies)} Policies!")
    
    # --- ADD THIS: SEED MASTER ADMIN ---
    admin_email = "admin@icra.com"
    existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
    
    if not existing_admin:
        print("🛡️ Creating Master Admin Account...")
        hashed_pwd = pwd_context.hash("Admin@123") # Default Password
        admin_user = models.User(
            name="Master Admin",
            email=admin_email,
            password=hashed_pwd,
            role="admin", # <--- The Magic Key
            dob=datetime.utcnow()
        )
        db.add(admin_user)
        db.commit()
        print(f"✅ Master Admin created: {admin_email} / Admin@123")

# --- STARTUP EVENT ---
@app.on_event("startup")
def startup_event():
    # Create Tables
    models.Base.metadata.create_all(bind=database.engine)
    
    # Run Seeder
    db = database.SessionLocal()
    try:
        seed_policies(db)
    finally:
        db.close()

# 3. CORS Middleware (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Security Tools
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
otp_storage = {}

# --- PASSWORD VALIDATION ---
def validate_password_strength(password: str):
    """
    Enforces: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
    """
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")
    return True

# --- HELPER FUNCTIONS ---

def create_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def check_admin_access(user: models.User = Depends(get_current_user)):
    """Helper function to ensure only admins can access certain endpoints"""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def send_email_otp(to_email: str, otp: str):
    # If no credentials in .env, mock the email (print to console)
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print(f"\n[MOCK EMAIL] To: {to_email} | OTP: {otp}\n")
        return True
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "ICRA Verification Code"

        body = f"""
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #2563EB;">Welcome to ICRA</h2>
              <p>Your verification code is:</p>
              <h1 style="letter-spacing: 5px; color: #1e293b;">{otp}</h1>
              <p>This code expires in 10 minutes.</p>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email Error: {e}")
        return False

# ==========================
# --- AUTH ENDPOINTS ---
# ==========================

@app.post("/auth/send-otp")
def send_otp(request: schemas.EmailRequest, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = str(random.randint(100000, 999999))
    otp_storage[request.email] = otp
    
    # Debug print for development
    print(f"------------\n[DEBUG] OTP for {request.email}: {otp}\n------------")
    
    if send_email_otp(request.email, otp):
        return {"message": "OTP sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.post("/auth/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # 1. Check OTP (If provided)
    if user.otp:
        stored_otp = otp_storage.get(user.email)
        if not stored_otp or stored_otp != user.otp:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        del otp_storage[user.email]

    # 2. Check existing user
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 3. Validate Password Strength
    validate_password_strength(user.password)
    
    # 4. Create User
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        dob=user.dob
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_token(data={"sub": new_user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_token(data={"sub": new_user.email}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/auth/login", response_model=schemas.Token)
@limiter.limit("5/minute")
def login(request: Request, user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # --- ADD THIS: Update Last Login ---
    db_user.last_login = datetime.utcnow()
    db.commit()
    
    access_token = create_token(data={"sub": db_user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_token(data={"sub": db_user.email}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.post("/auth/refresh", response_model=schemas.Token)
def refresh_token(request: schemas.RefreshTokenRequest, db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    
    # Generate new tokens
    access_token = create_token(data={"sub": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    new_refresh_token = create_token(data={"sub": user.email}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/auth/logout")
def logout(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Force the user's last_login to a past date so they don't show as online
    user.last_login = datetime.utcnow() - timedelta(days=365) 
    db.commit()
    return {"msg": "Logged out successfully"}

# ==========================
# --- POLICY ENDPOINTS ---
# ==========================

@app.get("/policies", response_model=List[schemas.PolicyResponse])
def get_policies(category: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Policy)
    if category and category != "All":
        query = query.filter(models.Policy.category == category)
    
    policies = query.all()
    
    # Inject Active User Count
    results = []
    for p in policies:
        # Count how many users have bought this policy
        count = db.query(models.UserPolicy).filter(models.UserPolicy.policy_id == p.id).count()
        
        # We convert to a dictionary to append the new field without changing the DB Model
        p_data = p.__dict__.copy()
        p_data['active_users'] = count
        results.append(p_data)
        
    return results

@app.get("/policies/{policy_id}", response_model=schemas.PolicyResponse)
def get_policy_detail(policy_id: int, db: Session = Depends(database.get_db)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

# ==========================
# --- BUYING & MY POLICIES ---
# ==========================

@app.post("/buy/{policy_id}")
def buy_policy(policy_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # 1. Check if policy exists
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    # 2. Check if user already bought it
    existing = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_id == user.id, 
        models.UserPolicy.policy_id == policy_id
    ).first()
    
    if existing:
        return {"message": "You already own this policy!"}
    
    # 3. Create Record
    new_purchase = models.UserPolicy(user_id=user.id, policy_id=policy_id)
    db.add(new_purchase)
    
    # 4. Create Notification
    notif = models.Notification(
        user_id=user.id,
        title="Purchase Successful",
        message=f"You have successfully purchased {policy.policy_name}. A receipt has been generated.",
        type="success"
    )
    db.add(notif)
    db.commit()
    
    return {"message": f"Successfully purchased {policy.policy_name}!"}

@app.get("/my-policies", response_model=List[schemas.MyPolicyResponse])
def get_my_policies(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Use joinedload to fetch the Policy details along with the purchase record
    purchases = db.query(models.UserPolicy)\
                  .options(joinedload(models.UserPolicy.policy))\
                  .filter(models.UserPolicy.user_id == user.id)\
                  .all()
    return purchases

@app.delete("/my-policies/{purchase_id}")
def delete_policy(purchase_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Find the purchase record (UserPolicy row)
    policy_entry = db.query(models.UserPolicy).filter(
        models.UserPolicy.id == purchase_id,
        models.UserPolicy.user_id == user.id
    ).first()
    
    if not policy_entry:
        raise HTTPException(status_code=404, detail="Policy purchase not found")
        
    db.delete(policy_entry)
    db.commit()
    return {"message": "Policy removed from your portfolio"}

# ==========================
# --- USER PROFILE ENDPOINTS ---
# ==========================

@app.put("/user/profile", response_model=schemas.UserResponse)
def update_risk_profile(
    profile_data: schemas.RiskProfileUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Convert Pydantic model to JSON-compatible dict
    user.risk_profile = profile_data.dict()
    
    db.commit()
    db.refresh(user)
    return user

@app.get("/recommendations")
def get_recommendations(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # 1. Run the engine
    recommendations.generate_recommendations(user.id, db)

    # 2. Fetch results
    recs = db.query(models.Recommendation)\
             .filter(models.Recommendation.user_id == user.id)\
             .order_by(models.Recommendation.score.desc())\
             .all()

    # 3. Format response
    results = []
    for rec in recs:
        results.append({
            "score": rec.score,
            "reason": rec.reason,
            "policy": rec.policy 
        })

    return results

# ==========================
# --- NOTIFICATION ENDPOINTS ---
# ==========================

@app.get("/notifications", response_model=List[schemas.Notification])
def get_notifications(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()

@app.put("/notifications/read")
def mark_read(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db.query(models.Notification).filter(models.Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"msg": "Marked as read"}

@app.delete("/notifications/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id, models.Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notif)
    db.commit()
    return {"msg": "Notification deleted"}

# ==========================
# --- CLAIMS ENDPOINTS ---
# ==========================

@app.post("/claims")
@limiter.limit("10/minute")
def file_claim(request: Request, claim: schemas.ClaimCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # Verify the user owns the policy
    purchase = db.query(models.UserPolicy).filter(models.UserPolicy.id == claim.purchase_id, models.UserPolicy.user_id == current_user.id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Policy not found")

    new_claim = models.Claim(
        user_id=current_user.id,
        purchase_id=claim.purchase_id,
        incident_type=claim.incident_type,
        description=claim.description,
        claim_amount=claim.claim_amount
    )
    db.add(new_claim)
    
    # Notify User
    notif = models.Notification(
        user_id=current_user.id,
        title="Claim Filed Successfully",
        message=f"Claim for ₹{claim.claim_amount} submitted. Status: Pending.",
        type="info"
    )
    db.add(notif)
    
    db.commit()
    
    # --- ADD THIS LINE FOR MILESTONE 4 ---
    fraud_engine.run_fraud_check(db, new_claim.id)
    
    return {"msg": "Claim submitted"}

@app.get("/claims", response_model=List[schemas.ClaimResponse])
def get_my_claims(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Claim).filter(models.Claim.user_id == current_user.id).all()

@app.delete("/claims/{claim_id}")
def delete_claim(claim_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id, models.Claim.user_id == current_user.id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    db.delete(claim)
    
    # Log the deletion
    notif = models.Notification(
        user_id=current_user.id,
        title="Claim Record Deleted",
        message=f"Claim ID #{1000+claim_id} has been removed from your history.",
        type="warning"
    )
    db.add(notif)
    
    db.commit()
    return {"msg": "Claim deleted"}

@app.put("/renew/{purchase_id}")
def renew_policy(purchase_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Find the policy
    purchase = db.query(models.UserPolicy).filter(models.UserPolicy.id == purchase_id, models.UserPolicy.user_id == current_user.id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # 2. Update Purchase Date to Today (Simulating a 1-year extension)
    purchase.purchase_date = datetime.utcnow()
    
    # 3. Add Notification
    notif = models.Notification(
        user_id=current_user.id,
        title="Policy Renewed",
        message=f"Your policy (ID: {purchase_id}) has been renewed for another year.",
        type="success"
    )
    db.add(notif)
    
    db.commit()
    return {"msg": "Policy renewed successfully"}

# ==========================
# --- MILESTONE 4: ADMIN & FRAUD ---
# ==========================

@app.post("/admin/scan/{claim_id}")
def trigger_fraud_scan(claim_id: int, user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    """Manually triggers the fraud engine for a specific claim"""
    fraud_engine.run_fraud_check(db, claim_id)
    return {"msg": "Scan complete"}

@app.get("/admin/dashboard-stats")
def get_admin_stats(user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    """Returns analytics for the admin dashboard"""
    total_users = db.query(models.User).count()
    total_claims = db.query(models.Claim).count()
    pending_claims = db.query(models.Claim).filter(models.Claim.status == "Pending").count()
    flagged_claims = db.query(models.FraudFlag).count()
    
    # --- UPDATED: 5 Minutes Window ---
    five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
    online_users = db.query(models.User).filter(models.User.last_login >= five_mins_ago).count()
    
    return {
        "users": total_users,
        "online_users": online_users, # <--- Return this new field
        "claims": total_claims,
        "pending": pending_claims,
        "fraud_alerts": flagged_claims
    }

@app.get("/admin/claims-feed")
def get_admin_claims(user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    """Fetches all claims WITH their fraud flags attached"""
    # 1. Get all claims
    claims = db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()
    results = []
    
    for c in claims:
        # 2. Get User Name
        user = db.query(models.User).filter(models.User.id == c.user_id).first()
        # 3. Get Flags
        flags = db.query(models.FraudFlag).filter(models.FraudFlag.claim_id == c.id).all()
        
        results.append({
            "id": c.id,
            "user": user.name if user else "Unknown",
            "type": c.incident_type,
            "description": c.description,
            "amount": c.claim_amount,
            "status": c.status,
            "date": c.created_at,
            "flags": [{"severity": f.severity, "code": f.rule_code, "details": f.details} for f in flags]
        })
    return results

@app.put("/admin/claims/{claim_id}/action")
def process_claim_action(claim_id: int, payload: schemas.ClaimAction, user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if payload.action.lower() == "approve":
        claim.status = "Approved"
        msg = f"Good news! Your claim #{1000+claim.id} for {claim.incident_type} has been APPROVED."
        typ = "success"
    
    elif payload.action.lower() == "reject":
        claim.status = "Rejected"
        reason = payload.reason or "Policy criteria not met."
        
        # SMART TRICK: Append the Admin Note to the description so it appears in User History without DB changes
        if "|| [Admin Note:" not in claim.description:
            claim.description = f"{claim.description} || [Admin Note: {reason}]"
            
        msg = f"Update on Claim #{1000+claim.id}: REJECTED. Reason: {reason}"
        typ = "warning"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    # Create Notification for User
    notif = models.Notification(
        user_id=claim.user_id,
        title=f"Claim {claim.status}",
        message=msg,
        type=typ
    )
    db.add(notif)
    db.commit()
    return {"msg": f"Claim {payload.action} successfully"}

# --- ADMIN CONTROL CENTER ENDPOINTS ---

@app.post("/admin/policies")
def create_policy(policy: schemas.PolicyCreate, user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    new_policy = models.Policy(**policy.dict())
    db.add(new_policy)
    db.commit()
    return {"msg": "Policy created successfully"}

@app.put("/admin/policies/{policy_id}")
def update_policy(policy_id: int, policy: schemas.PolicyCreate, user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    db_policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not db_policy:
         raise HTTPException(status_code=404, detail="Policy not found")
    
    # Update fields
    db_policy.category = policy.category
    db_policy.provider = policy.provider
    db_policy.policy_name = policy.policy_name
    db_policy.premium = policy.premium
    db_policy.cover_amount = policy.cover_amount
    db_policy.description = policy.description
    db_policy.features = policy.features
    
    db.commit()
    return {"msg": "Policy updated successfully"}

@app.delete("/admin/policies/{policy_id}")
def delete_policy_admin(policy_id: int, user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    # Check if used
    usage = db.query(models.UserPolicy).filter(models.UserPolicy.policy_id == policy_id).count()
    if usage > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete: Active in {usage} user portfolios.")
    
    db.query(models.Policy).filter(models.Policy.id == policy_id).delete()
    db.commit()
    return {"msg": "Policy deleted"}

@app.get("/admin/users-list")
def get_all_users(user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@app.delete("/admin/users/{user_id}")
def ban_user(user_id: int, user: models.User = Depends(check_admin_access), db: Session = Depends(database.get_db)):
    if user_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself.")
    
    # Cascade delete (Or just delete user, sqlalchemy handles cascade if set, otherwise manual)
    db.query(models.UserPolicy).filter(models.UserPolicy.user_id == user_id).delete()
    db.query(models.User).filter(models.User.id == user_id).delete()
    db.commit()
    return {"msg": "User and their data removed."}