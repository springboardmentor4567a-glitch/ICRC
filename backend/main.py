import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv

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
    allow_origins=["*"],
    allow_credentials=False,
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
