from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import List, Optional
import models, schemas, database
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer

# 1. Load Environment Variables
load_dotenv()

# --- CONFIGURATION ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480 
REFRESH_TOKEN_EXPIRE_DAYS = 7

# --- EMAIL CONFIGURATION ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("MAIL_USERNAME")
SENDER_PASSWORD = os.getenv("MAIL_PASSWORD")

app = FastAPI(title="ICRA API")

# 2. Setup Database
models.Base.metadata.create_all(bind=database.engine)

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
    
    # 3. Create User
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
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token = create_token(data={"sub": db_user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_token(data={"sub": db_user.email}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user
    }

# ==========================
# --- POLICY ENDPOINTS ---
# ==========================

@app.get("/policies", response_model=List[schemas.PolicyResponse])
def get_policies(category: Optional[str] = None, db: Session = Depends(database.get_db)):
    if category and category != "All":
        policies = db.query(models.Policy).filter(models.Policy.category == category).all()
    else:
        policies = db.query(models.Policy).all()
    return policies

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
    db.commit()
    
    return {"message": f"Successfully purchased {policy.policy_name}!"}

@app.get("/my-policies", response_model=List[schemas.MyPolicyResponse])
def get_my_policies(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Fetch all policies owned by the current user
    purchases = db.query(models.UserPolicy).filter(models.UserPolicy.user_id == user.id).all()
    return purchases