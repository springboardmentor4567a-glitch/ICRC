# backend/app/main.py
from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import time
import sqlite3
import os
import json
import random
from datetime import datetime, timedelta
from typing import List, Optional
from threading import Thread
from .auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from .s3_service import s3_service

# Configure logging
logger = logging.getLogger(__name__)

try:
    from .tasks import send_claim_notification, send_welcome_email
    CELERY_AVAILABLE = True
except Exception as e:
    CELERY_AVAILABLE = False
    logger.warning(f"Celery not available: {e}")
import urllib.request
import urllib.error

# Lightweight rule-based chatbot (no external AI dependency)
def generate_chat_response(message: str):
    msg = (message or "").strip().lower()
    followups = [
        "Ask about filing a claim",
        "Compare policies",
        "Check claim status",
        "Find the best premium"
    ]

    if not msg:
        return (
            "Hi! I’m your insurance assistant. Ask me about claims, policies, or premiums.",
            followups,
        )

    if "claim" in msg and ("file" in msg or "submit" in msg):
        return (
            "To file a claim: go to File Claim, choose policy type, add details, and upload documents.",
            ["How long does claim approval take?", "What documents are needed?"],
        )

    if "status" in msg and "claim" in msg:
        return (
            "Open Track Claims to see current status. If it's pending >48h, contact support.",
            ["How to contact support?", "What does ‘Under Review’ mean?"],
        )

    if "policy" in msg and ("compare" in msg or "best" in msg):
        return (
            "Use Policy Comparison to see coverage, premium, deductible, and ratings side-by-side.",
            ["Show top health plans", "What is deductible?"],
        )

    if "premium" in msg or "cost" in msg or "price" in msg:
        return (
            "Open Premium Calculator, enter coverage and details to estimate your monthly premium.",
            ["How to lower premium?", "Explain deductible vs premium"],
        )

    if "recommend" in msg or "recommendation" in msg:
        return (
            "Go to Recommendations; we rank policies by fit and score for your profile.",
            ["What data do you use?", "Show top life policies"],
        )

    if "contact" in msg or "support" in msg:
        return (
            "You can reach support via email or phone shown in the app footer. For urgent claim issues, include your claim number.",
            ["Where is the phone number?", "How to escalate a claim?"],
        )

    # Default fallback
    generic = [
        "I'm here to help with claims, policies, and premiums.",
        "Try asking about filing a claim, comparing policies, or calculating a premium.",
        "You can also ask how to track a claim status.",
    ]
    return (random.choice(generic), followups)


# Optional: real LLM call (uses environment variables; falls back to rule-based)
LLM_API_URL = os.getenv("LLM_API_URL")  # e.g., https://api.openai.com/v1/chat/completions
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")

def generate_llm_response(message: str):
    if not LLM_API_URL or not LLM_API_KEY:
        return None
    try:
        payload = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": "You are a concise insurance assistant. Answer briefly."},
                {"role": "user", "content": message or ""},
            ],
            "temperature": 0.2,
            "max_tokens": 160,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            LLM_API_URL,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {LLM_API_KEY}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read()
            parsed = json.loads(body)
            # OpenAI-style response parsing
            choices = parsed.get("choices") or []
            if choices and choices[0].get("message", {}).get("content"):
                return choices[0]["message"]["content"].strip()
            # Some providers might return "response" directly
            if parsed.get("response"):
                return str(parsed["response"]).strip()
    except Exception as e:
        logger.warning(f"LLM call failed: {e}")
    return None

# basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple sqlite DB for quick dev testing
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

def connect_db():
    """Return sqlite connection tuned to avoid long waits on locked DB."""
    conn = sqlite3.connect(DB_PATH, timeout=5, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout = 5000")
    conn.execute("PRAGMA synchronous = NORMAL")
    return conn

def init_db():
    conn = connect_db()
    c = conn.cursor()
    
    # Users table
    c.execute("""CREATE TABLE IF NOT EXISTS users (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT,
                 email TEXT UNIQUE,
                 username TEXT UNIQUE,
                 mobile TEXT,
                 password_hash TEXT,
                 notify_claim_updates INTEGER DEFAULT 1,
                 notify_policy_updates INTEGER DEFAULT 1,
                 notify_promotions INTEGER DEFAULT 0
                 )""")
    
    # Insurance policies table
    c.execute("""CREATE TABLE IF NOT EXISTS insurance_policies (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 policy_name TEXT NOT NULL,
                 policy_type TEXT NOT NULL,
                 provider TEXT NOT NULL,
                 coverage_amount REAL NOT NULL,
                 premium_monthly REAL NOT NULL,
                 premium_yearly REAL NOT NULL,
                 deductible REAL NOT NULL,
                 features TEXT,
                 rating REAL DEFAULT 0.0,
                 description TEXT,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                 )""")
    
    # Claims table
    c.execute("""CREATE TABLE IF NOT EXISTS claims (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER NOT NULL,
                 claim_number TEXT UNIQUE NOT NULL,
                 policy_type TEXT NOT NULL,
                 claim_type TEXT NOT NULL,
                 claim_amount REAL NOT NULL,
                 description TEXT NOT NULL,
                 incident_date TIMESTAMP NOT NULL,
                 status TEXT DEFAULT 'Submitted',
                 documents TEXT,
                 fraud_score REAL DEFAULT 0.0,
                 fraud_flags TEXT,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 FOREIGN KEY (user_id) REFERENCES users(id)
                 )""")
    
    # Claim history table
    c.execute("""CREATE TABLE IF NOT EXISTS claim_history (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 claim_id INTEGER NOT NULL,
                 status TEXT NOT NULL,
                 notes TEXT,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 FOREIGN KEY (claim_id) REFERENCES claims(id)
                 )""")
    
    # User policies table
    c.execute("""CREATE TABLE IF NOT EXISTS user_policies (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER NOT NULL,
                 policy_id INTEGER NOT NULL,
                 purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 expiry_date TIMESTAMP,
                 status TEXT DEFAULT 'Active',
                 FOREIGN KEY (user_id) REFERENCES users(id),
                 FOREIGN KEY (policy_id) REFERENCES insurance_policies(id)
                 )""")
    
    # Policy recommendations table
    c.execute("""CREATE TABLE IF NOT EXISTS policy_recommendations (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER NOT NULL,
                 policy_id INTEGER NOT NULL,
                 recommendation_score REAL NOT NULL,
                 reason TEXT,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 FOREIGN KEY (user_id) REFERENCES users(id),
                 FOREIGN KEY (policy_id) REFERENCES insurance_policies(id)
                 )""")
    
    # Insert sample policies if table is empty
    c.execute("SELECT COUNT(*) FROM insurance_policies")
    if c.fetchone()[0] == 0:
        sample_policies = [
            # Health Insurance
            ("Premium Health Plus", "Health", "HealthCare Inc", 500000, 450, 5000, 10000, 
             json.dumps(["100% hospitalization", "Pre-existing conditions covered", "No claim bonus", "Cashless treatment"]), 
             4.5, "Comprehensive health coverage with no waiting period"),
            ("Basic Health Shield", "Health", "MediGuard", 200000, 250, 2800, 15000,
             json.dumps(["80% hospitalization", "Wellness benefits", "Telemedicine"]),
             4.0, "Affordable health insurance for individuals"),
            ("Family Health Care", "Health", "FamilyCare Plus", 1000000, 800, 9000, 20000,
             json.dumps(["Family floater", "Maternity coverage", "Child vaccination", "Annual checkups"]),
             4.7, "Complete family health protection"),
            
            # Auto Insurance
            ("Comprehensive Auto Cover", "Auto", "AutoSecure", 1000000, 300, 3400, 5000,
             json.dumps(["Zero depreciation", "24/7 roadside assistance", "Personal accident cover"]),
             4.3, "Complete car protection with zero depreciation"),
            ("Third Party Auto", "Auto", "DriveShield", 500000, 120, 1300, 2000,
             json.dumps(["Legal liability cover", "Personal accident"]),
             3.8, "Legally compliant third-party coverage"),
            
            # Home Insurance
            ("Home Protection Plus", "Home", "HomeSafe Insurance", 5000000, 400, 4500, 25000,
             json.dumps(["Structure damage", "Content protection", "Natural disasters", "Theft coverage"]),
             4.6, "Complete home and content protection"),
            ("Basic Home Guard", "Home", "SafeNest", 2000000, 200, 2200, 15000,
             json.dumps(["Fire coverage", "Burglary protection", "Natural calamities"]),
             4.1, "Essential home protection coverage"),
            
            # Life Insurance
            ("Term Life Supreme", "Life", "LifeGuard Corp", 10000000, 600, 7000, 0,
             json.dumps(["Life cover", "Accidental death benefit", "Critical illness rider"]),
             4.8, "Maximum life protection with affordable premium"),
            ("Whole Life Assurance", "Life", "EverLife", 5000000, 1200, 14000, 0,
             json.dumps(["Life cover", "Maturity benefits", "Loan facility", "Tax benefits"]),
             4.4, "Life insurance with savings component"),
        ]
        
        c.executemany(
            """INSERT INTO insurance_policies 
               (policy_name, policy_type, provider, coverage_amount, premium_monthly, 
                premium_yearly, deductible, features, rating, description) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            sample_policies
        )
    
    conn.commit()
    conn.close()

init_db()

@app.post("/api/register")
async def register(request: Request):
    try:
        payload = await request.json()
        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        username = (payload.get("username") or email).strip().lower()
        mobile = (payload.get("mobile") or "").strip()
        password = payload.get("password") or ""

        # validation
        if not name or not email or not password:
            return JSONResponse(status_code=400, content={"message":"name, email and password are required"})

        if len(password) < 6:
            return JSONResponse(status_code=400, content={"message":"password must be >= 6 chars"})

        pw_hash = get_password_hash(password)

        conn = None
        last_err = None
        for attempt in range(3):
            try:
                conn = connect_db()
                c = conn.cursor()
                c.execute(
                    "INSERT INTO users (name,email,username,mobile,password_hash) VALUES (?,?,?,?,?)",
                    (name,email,username,mobile,pw_hash)
                )
                conn.commit()
                break
            except sqlite3.OperationalError as op_err:
                msg = str(op_err).lower()
                last_err = op_err
                if "locked" in msg or "busy" in msg:
                    # brief backoff to avoid spinning when WAL is busy
                    time.sleep(0.2 * (attempt + 1))
                    continue
                logger.exception(f"Operational DB error during registration: {op_err}")
                return JSONResponse(status_code=500, content={"message":f"Database error: {str(op_err)}"})
            except sqlite3.IntegrityError:
                logger.exception("Integrity error on register")
                return JSONResponse(status_code=409, content={"message":"User with this email/username already exists"})
            except Exception as db_err:
                logger.exception(f"Database error during registration: {db_err}")
                return JSONResponse(status_code=500, content={"message":f"Database error: {str(db_err)}"})
            finally:
                if conn:
                    conn.close()

        if last_err and isinstance(last_err, sqlite3.OperationalError):
            logger.warning("Registration blocked because database is busy/locked after retries")
            return JSONResponse(status_code=503, content={"message":"Database is busy. Please retry in a moment."})

        return JSONResponse(status_code=201, content={"message":"Registered successfully"})
    except Exception as e:
        logger.exception(f"Registration error: {e}")
        # return safe JSON (do not leak secrets)
        return JSONResponse(status_code=500, content={"message":"Internal server error during registration", "error": str(e)})

@app.post("/api/login")
async def login(request: Request):
    try:
        payload = await request.json()
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not email or not password:
            return JSONResponse(status_code=400, content={"message":"email and password are required"})

        conn = connect_db()
        c = conn.cursor()
        c.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (email,))
        user = c.fetchone()
        conn.close()

        if not user or not verify_password(password, user[3]):
            return JSONResponse(status_code=401, content={"message":"Invalid credentials"})

        access_token = create_access_token(str(user[0]))
        refresh_token = create_refresh_token(str(user[0]))
        return JSONResponse(content={
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {"id": user[0], "name": user[1], "email": user[2]},
            "message": "Login successful"
        })
    except Exception as e:
        logger.exception("Login error")
        return JSONResponse(status_code=500, content={"message":"Internal server error during login", "error": str(e)})


@app.post("/api/refresh")
async def refresh_token_endpoint(request: Request):
    try:
        payload = await request.json()
        refresh_token = payload.get("refresh_token") or ""
        if not refresh_token:
            return JSONResponse(status_code=400, content={"message": "refresh_token is required"})

        decoded = decode_token(refresh_token)
        if not decoded or decoded.get("type") != "refresh":
            return JSONResponse(status_code=401, content={"message": "Invalid refresh token"})

        user_id = decoded.get("sub")
        if not user_id:
            return JSONResponse(status_code=401, content={"message": "Invalid refresh token payload"})

        # Optionally verify user still exists
        conn = connect_db()
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            return JSONResponse(status_code=404, content={"message": "User not found"})

        new_access = create_access_token(str(user_id))
        return JSONResponse(content={
            "access_token": new_access,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "token_type": "bearer"
        })
    except Exception as e:
        logger.exception("Refresh error")
        return JSONResponse(status_code=500, content={"message": "Internal server error during refresh", "error": str(e)})


# ============= AI CHATBOT (RULE-BASED) =============

@app.post("/api/chatbot")
async def chatbot(request: Request):
    try:
        data = await request.json()
        message = (data.get("message") or "").strip()
        
        if not message:
            reply = "Hi! I'm your insurance assistant. Ask me about claims, policies, or premiums."
            suggestions = ["Ask about filing a claim", "Compare policies", "Check claim status", "Find the best premium"]
            return JSONResponse(content={"reply": reply, "suggestions": suggestions})
        
        reply, suggestions = generate_chat_response(message)
        
        if not reply:
            reply = "I'm here to help with claims, policies, and premiums. Please ask me something."
            suggestions = []
        
        return JSONResponse(content={
            "reply": reply,
            "suggestions": suggestions,
        })
    except Exception as e:
        logger.exception(f"Chatbot error: {e}")
        return JSONResponse(status_code=500, content={
            "message": "Chatbot error", 
            "error": str(e),
            "reply": "Sorry, I encountered an error. Please try again."
        })


@app.post("/api/chatbot/llm")
async def chatbot_llm(request: Request):
    """LLM-powered chatbot. Requires LLM_API_URL and LLM_API_KEY env vars. Falls back to rule-based if not configured."""
    try:
        data = await request.json()
        message = (data.get("message") or "").strip()

        # Try real LLM first
        llm_reply = generate_llm_response(message)
        if llm_reply:
            return JSONResponse(content={"reply": llm_reply, "suggestions": []})

        # Fallback to rule-based
        reply, suggestions = generate_chat_response(message)
        
        if not reply:
            reply = "I'm here to help with claims, policies, and premiums. Please ask me something."
            suggestions = []
        
        return JSONResponse(content={
            "reply": reply,
            "suggestions": suggestions,
            "note": "LLM not configured; used rule-based fallback"
        })
    except Exception as e:
        logger.exception(f"LLM Chatbot error: {e}")
        return JSONResponse(status_code=500, content={
            "message": "LLM chatbot error", 
            "error": str(e),
            "reply": "Sorry, I encountered an error. Please try again."
        })


# ============= POLICY COMPARISON ENDPOINTS =============

@app.get("/api/policies")
async def get_policies(policy_type: str = None):
    """Get all policies or filter by policy type"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        if policy_type:
            c.execute("""SELECT id, policy_name, policy_type, provider, coverage_amount, 
                        premium_monthly, premium_yearly, deductible, features, rating, 
                        description, created_at FROM insurance_policies 
                        WHERE policy_type = ?""", (policy_type,))
        else:
            c.execute("""SELECT id, policy_name, policy_type, provider, coverage_amount, 
                        premium_monthly, premium_yearly, deductible, features, rating, 
                        description, created_at FROM insurance_policies""")
        
        policies = []
        for row in c.fetchall():
            policies.append({
                "id": row[0],
                "policy_name": row[1],
                "policy_type": row[2],
                "provider": row[3],
                "coverage_amount": row[4],
                "premium_monthly": row[5],
                "premium_yearly": row[6],
                "deductible": row[7],
                "features": json.loads(row[8]) if row[8] else [],
                "rating": row[9],
                "description": row[10],
                "created_at": row[11]
            })
        
        conn.close()
        return JSONResponse(content={"policies": policies})
    except Exception as e:
        logger.exception("Error fetching policies")
        return JSONResponse(status_code=500, content={"message": "Error fetching policies", "error": str(e)})


@app.get("/api/policies/compare")
async def compare_policies(policy_ids: str):
    """Compare multiple policies by IDs (comma-separated)"""
    try:
        ids = [int(id.strip()) for id in policy_ids.split(",")]
        conn = connect_db()
        c = conn.cursor()
        
        placeholders = ",".join("?" * len(ids))
        c.execute(f"""SELECT id, policy_name, policy_type, provider, coverage_amount, 
                     premium_monthly, premium_yearly, deductible, features, rating, 
                     description FROM insurance_policies 
                     WHERE id IN ({placeholders})""", ids)
        
        policies = []
        for row in c.fetchall():
            policies.append({
                "id": row[0],
                "policy_name": row[1],
                "policy_type": row[2],
                "provider": row[3],
                "coverage_amount": row[4],
                "premium_monthly": row[5],
                "premium_yearly": row[6],
                "deductible": row[7],
                "features": json.loads(row[8]) if row[8] else [],
                "rating": row[9],
                "description": row[10]
            })
        
        conn.close()
        return JSONResponse(content={"comparison": policies})
    except Exception as e:
        logger.exception("Error comparing policies")
        return JSONResponse(status_code=500, content={"message": "Error comparing policies", "error": str(e)})


# ============= PREMIUM CALCULATOR ENDPOINT =============

@app.post("/api/calculate-premium")
async def calculate_premium(request: Request):
    """Calculate insurance premium based on user inputs"""
    try:
        data = await request.json()
        policy_type = data.get("policy_type")
        age = data.get("age", 30)
        coverage_amount = data.get("coverage_amount", 500000)
        deductible = data.get("deductible", 10000)
        risk_factors = data.get("risk_factors", [])
        location = data.get("location", "")
        
        # Base premium calculation (simplified algorithm)
        base_rate = {
            "Health": 0.008,
            "Auto": 0.004,
            "Home": 0.003,
            "Life": 0.006
        }.get(policy_type, 0.005)
        
        # Calculate base premium
        base_premium = coverage_amount * base_rate / 12
        
        # Age factor
        if policy_type in ["Health", "Life"]:
            if age < 25:
                base_premium *= 0.9
            elif age > 50:
                base_premium *= 1.5
            elif age > 40:
                base_premium *= 1.2
        
        # Deductible adjustment (higher deductible = lower premium)
        deductible_factor = 1.0 - (deductible / coverage_amount * 0.3)
        base_premium *= max(deductible_factor, 0.7)
        
        # Risk factors adjustment
        risk_multiplier = 1.0 + (len(risk_factors) * 0.1)
        base_premium *= risk_multiplier
        
        # Location factor (urban = higher)
        if location.lower() in ["urban", "city", "metro"]:
            base_premium *= 1.15
        
        monthly_premium = round(base_premium, 2)
        yearly_premium = round(monthly_premium * 12 * 0.95, 2)  # 5% discount for yearly
        
        factors_considered = [
            f"Age: {age} years",
            f"Coverage: ₹{coverage_amount:,}",
            f"Deductible: ₹{deductible:,}",
            f"Risk factors: {len(risk_factors)}"
        ]
        
        if location:
            factors_considered.append(f"Location: {location}")
        
        return JSONResponse(content={
            "monthly_premium": monthly_premium,
            "yearly_premium": yearly_premium,
            "coverage_amount": coverage_amount,
            "deductible": deductible,
            "factors_considered": factors_considered
        })
    except Exception as e:
        logger.exception("Error calculating premium")
        return JSONResponse(status_code=500, content={"message": "Error calculating premium", "error": str(e)})


# ============= PERSONALIZED RECOMMENDATIONS ENDPOINT =============

@app.post("/api/recommendations")
async def get_recommendations(request: Request):
    """Get personalized policy recommendations"""
    try:
        data = await request.json()
        user_id = data.get("user_id")
        policy_type = data.get("policy_type")
        age = int(data.get("age", 30) or 30)
        budget = float(data.get("budget", 500) or 500)
        coverage_needs = data.get("coverage_needs", []) or []
        risk_tolerance = (data.get("risk_tolerance") or "Medium").lower()
        priority = (data.get("priority") or "balanced").lower()  # coverage | premium | balanced
        dependents = int(data.get("dependents", 0) or 0)
        location_risk = (data.get("location_risk") or "normal").lower()  # normal | high

        coverage_baseline = {
            "Health": 500000,
            "Auto": 500000,
            "Home": 2000000,
            "Life": 5000000,
        }
        deductible_caps = {
            "Health": 10000,
            "Auto": 5000,
            "Home": 25000,
            "Life": 0,
        }

        conn = connect_db()
        c = conn.cursor()
        
        # Get policies matching type and budget tolerance (20% over stated budget)
        c.execute("""SELECT id, policy_name, policy_type, provider, coverage_amount, 
                    premium_monthly, premium_yearly, deductible, features, rating, 
                    description FROM insurance_policies 
                    WHERE policy_type = ? AND premium_monthly <= ?
                    ORDER BY rating DESC, premium_monthly ASC""", 
                 (policy_type, budget * 1.2))
        
        recommendations = []
        for row in c.fetchall():
            features = json.loads(row[8]) if row[8] else []

            rating_score = row[9] * 18  # up to 90

            # Budget fit: reward being under budget, gently penalize over
            if budget > 0:
                budget_gap = row[5] - budget
                if budget_gap <= 0:
                    budget_score = min(15, abs(budget_gap) / max(1, budget) * 20)
                else:
                    budget_score = -min(10, budget_gap / max(1, budget) * 15)
            else:
                budget_score = 0

            # Coverage strength relative to typical baseline per type
            baseline = coverage_baseline.get(policy_type, 500000)
            coverage_score = min(25, (row[4] / baseline) * 10)

            # Feature match
            matching_features = sum(1 for need in coverage_needs 
                                   if any(need.lower() in f.lower() for f in features))
            feature_score = matching_features * 4

            # Risk tolerance vs deductible
            deductible_cap = deductible_caps.get(policy_type, 10000)
            risk_score = 0
            if risk_tolerance == "low":
                risk_score += 8 if row[7] <= deductible_cap else -5
            elif risk_tolerance == "high":
                if row[7] > deductible_cap * 1.2:
                    risk_score += 5

            # Dependents and age considerations (health/life focus)
            dependents_score = 0
            if policy_type in ["Health", "Life"]:
                if dependents > 0:
                    dependents_score += 5 if row[4] >= baseline * 1.2 else 2
                if age > 55 and row[4] >= baseline * 1.2:
                    dependents_score += 3

            # Location risk (home/auto)
            location_score = 0
            if policy_type in ["Home", "Auto"] and location_risk == "high":
                if row[4] >= baseline * 1.1:
                    location_score += 3

            # Priority weighting
            priority_boost = 0
            if priority == "coverage":
                priority_boost += coverage_score * 0.3
            elif priority == "premium":
                priority_boost += budget_score * 0.5

            score = rating_score + budget_score + coverage_score + feature_score + risk_score + dependents_score + location_score + priority_boost

            reason_parts = []
            if row[9] >= 4.5:
                reason_parts.append("Highly rated policy")
            if budget_score > 0:
                reason_parts.append("Within or under your budget")
            if matching_features > 0:
                reason_parts.append(f"Matches {matching_features} of your needs")
            if coverage_score >= 15:
                reason_parts.append("Strong coverage for this category")
            if risk_tolerance == "low" and row[7] <= deductible_cap:
                reason_parts.append("Low deductible aligns with low risk tolerance")
            if priority == "premium" and budget_score > 0:
                reason_parts.append("Optimized for lower premium as requested")
            if priority == "coverage" and coverage_score >= 15:
                reason_parts.append("Optimized for higher coverage as requested")
            if dependents > 0 and policy_type in ["Health", "Life"] and row[4] >= baseline * 1.2:
                reason_parts.append("Higher coverage suitable for dependents")

            recommendations.append({
                "id": row[0],
                "policy": {
                    "id": row[0],
                    "policy_name": row[1],
                    "policy_type": row[2],
                    "provider": row[3],
                    "coverage_amount": row[4],
                    "premium_monthly": row[5],
                    "premium_yearly": row[6],
                    "deductible": row[7],
                    "features": features,
                    "rating": row[9],
                    "description": row[10]
                },
                "recommendation_score": max(0, min(score, 100)),
                "reason": "; ".join(reason_parts) if reason_parts else "Balanced match for your inputs",
                "reason_details": reason_parts
            })
        
        # Sort by recommendation score
        recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        # Save top recommendations to database if user_id provided
        if user_id and recommendations:
            for rec in recommendations[:3]:  # Save top 3
                c.execute("""INSERT INTO policy_recommendations 
                           (user_id, policy_id, recommendation_score, reason) 
                           VALUES (?, ?, ?, ?)""",
                        (user_id, rec["policy"]["id"], rec["recommendation_score"], rec["reason"]))
            conn.commit()
        
        conn.close()
        return JSONResponse(content={"recommendations": recommendations[:5]})  # Return top 5
    except Exception as e:
        logger.exception("Error getting recommendations")
        return JSONResponse(status_code=500, content={"message": "Error getting recommendations", "error": str(e)})


# ============= CLAIM FILING ENDPOINTS =============

@app.post("/api/claims")
async def file_claim(
    user_id: int = Form(...),
    policy_type: str = Form(...),
    claim_type: str = Form(...),
    claim_amount: float = Form(...),
    description: str = Form(...),
    incident_date: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    """File a new insurance claim with file uploads"""
    conn = None
    initial_status = "Submitted"  # Default status
    try:
        if not all([user_id, policy_type, claim_type, claim_amount, description, incident_date]):
            return JSONResponse(status_code=400, content={"message": "Missing required fields"})
        
        # Generate claim number
        claim_number = f"CLM{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(100, 999)}"
        
        # Upload files to S3
        uploaded_files = []
        for file in files:
            if file.filename:
                result = s3_service.upload_file(file.file, file.filename, claim_number)
                if result.get("success"):
                    uploaded_files.append({
                        "filename": result["original_filename"],
                        "file_key": result["file_key"],
                        "file_url": result["file_url"]
                    })
        
        # Fraud detection (rules-based)
        fraud_score, fraud_flags = detect_fraud(claim_amount, claim_type, description, uploaded_files)
        
        # Database operations with retry logic
        claim_id = None
        last_error = None
        
        for attempt in range(3):
            try:
                conn = connect_db()
                c = conn.cursor()
                
                # Get user email for notification
                c.execute("SELECT email FROM users WHERE id = ?", (user_id,))
                user_row = c.fetchone()
                user_email = user_row[0] if user_row else None
                
                # Insert claim
                c.execute("""INSERT INTO claims 
                            (user_id, claim_number, policy_type, claim_type, claim_amount, 
                             description, incident_date, documents, fraud_score, fraud_flags) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                         (user_id, claim_number, policy_type, claim_type, claim_amount, 
                          description, incident_date, json.dumps(uploaded_files), fraud_score, json.dumps(fraud_flags)))
                
                claim_id = c.lastrowid
                
                # Add initial history entry
                initial_status = "Under Review" if fraud_score > 50 else "Submitted"
                c.execute("""INSERT INTO claim_history (claim_id, status, notes) 
                            VALUES (?, ?, ?)""",
                         (claim_id, initial_status, "Claim submitted successfully"))
                
                # Update claim status if flagged
                if fraud_score > 50:
                    c.execute("UPDATE claims SET status = ? WHERE id = ?", (initial_status, claim_id))
                
                conn.commit()
                logger.info(f"Claim {claim_number} created successfully with ID {claim_id}")
                break
                
            except sqlite3.OperationalError as op_err:
                msg = str(op_err).lower()
                last_error = op_err
                if "locked" in msg or "busy" in msg:
                    logger.warning(f"Database busy on attempt {attempt + 1}, retrying...")
                    time.sleep(0.5 * (attempt + 1))
                    continue
                else:
                    logger.exception(f"Database operational error: {op_err}")
                    raise
            except sqlite3.IntegrityError as ie:
                logger.exception(f"Integrity error creating claim: {ie}")
                raise
            finally:
                if conn:
                    conn.close()
        
        if claim_id is None:
            if last_error:
                logger.error(f"Failed to create claim after retries: {last_error}")
                return JSONResponse(status_code=503, content={"message": "Database is busy. Please retry in a moment."})
            else:
                return JSONResponse(status_code=500, content={"message": "Failed to create claim"})
        
        # Send email notification in background thread
        if user_email:
            def send_email_async():
                try:
                    if CELERY_AVAILABLE:
                        send_claim_notification(
                            user_email, 
                            claim_number, 
                            initial_status,
                            "Your claim has been received and is being processed."
                        )
                    else:
                        logger.info(f"[EMAIL] Claim notification for {user_email}: {claim_number} - {initial_status}")
                except Exception as e:
                    logger.warning(f"Failed to send email notification: {e}")
            
            # Send email in background thread to avoid blocking response
            email_thread = Thread(target=send_email_async, daemon=True)
            email_thread.start()
        
        return JSONResponse(status_code=201, content={
            "message": "Claim filed successfully",
            "claim_number": claim_number,
            "claim_id": claim_id,
            "status": initial_status,
            "uploaded_files": len(uploaded_files),
            "fraud_analysis": {
                "fraud_score": fraud_score,
                "risk_level": "High" if fraud_score > 70 else "Medium" if fraud_score > 40 else "Low",
                "flags": fraud_flags
            }
        })
    except Exception as e:
        logger.exception("Error filing claim")
        return JSONResponse(status_code=500, content={"message": "Error filing claim", "error": str(e)})
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass


@app.get("/api/claims/{claim_id}")
async def get_claim_details(claim_id: int):
    """Get detailed information about a specific claim"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("""SELECT id, user_id, claim_number, policy_type, claim_type, 
                    claim_amount, description, incident_date, status, documents, 
                    fraud_score, fraud_flags, created_at, updated_at 
                    FROM claims WHERE id = ?""", (claim_id,))
        
        row = c.fetchone()
        if not row:
            conn.close()
            return JSONResponse(status_code=404, content={"message": "Claim not found"})
        
        claim = {
            "id": row[0],
            "user_id": row[1],
            "claim_number": row[2],
            "policy_type": row[3],
            "claim_type": row[4],
            "claim_amount": row[5],
            "description": row[6],
            "incident_date": row[7],
            "status": row[8],
            "documents": json.loads(row[9]) if row[9] else [],
            "fraud_score": row[10],
            "fraud_flags": json.loads(row[11]) if row[11] else [],
            "created_at": row[12],
            "updated_at": row[13]
        }
        
        # Get claim history
        c.execute("""SELECT id, status, notes, created_at 
                    FROM claim_history WHERE claim_id = ? 
                    ORDER BY created_at DESC""", (claim_id,))
        
        history = []
        for h_row in c.fetchall():
            history.append({
                "id": h_row[0],
                "status": h_row[1],
                "notes": h_row[2],
                "created_at": h_row[3]
            })
        
        claim["history"] = history
        
        conn.close()
        return JSONResponse(content={"claim": claim})
    except Exception as e:
        logger.exception("Error fetching claim details")
        return JSONResponse(status_code=500, content={"message": "Error fetching claim", "error": str(e)})


@app.get("/api/users/{user_id}/claims")
async def get_user_claims(user_id: int):
    """Get all claims for a specific user"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("""SELECT id, claim_number, policy_type, claim_type, claim_amount, 
                    status, incident_date, created_at, fraud_score 
                    FROM claims WHERE user_id = ? 
                    ORDER BY created_at DESC""", (user_id,))
        
        claims = []
        for row in c.fetchall():
            claims.append({
                "id": row[0],
                "claim_number": row[1],
                "policy_type": row[2],
                "claim_type": row[3],
                "claim_amount": row[4],
                "status": row[5],
                "incident_date": row[6],
                "created_at": row[7],
                "fraud_score": row[8]
            })
        
        conn.close()
        return JSONResponse(content={"claims": claims})
    except Exception as e:
        logger.exception("Error fetching user claims")
        return JSONResponse(status_code=500, content={"message": "Error fetching claims", "error": str(e)})


@app.put("/api/claims/{claim_id}/status")
async def update_claim_status(claim_id: int, request: Request):
    """Update claim status (admin function - can be enhanced with auth)"""
    try:
        data = await request.json()
        new_status = data.get("status")
        notes = data.get("notes", "")
        
        if not new_status:
            return JSONResponse(status_code=400, content={"message": "Status is required"})
        
        conn = connect_db()
        c = conn.cursor()
        
        # Get claim and user info for notification
        c.execute("""SELECT c.claim_number, c.user_id, u.email 
                    FROM claims c 
                    JOIN users u ON c.user_id = u.id 
                    WHERE c.id = ?""", (claim_id,))
        claim_row = c.fetchone()
        
        if not claim_row:
            conn.close()
            return JSONResponse(status_code=404, content={"message": "Claim not found"})
        
        claim_number, user_id, user_email = claim_row
        
        # Update claim status
        c.execute("UPDATE claims SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
                 (new_status, claim_id))
        
        # Add history entry
        c.execute("INSERT INTO claim_history (claim_id, status, notes) VALUES (?, ?, ?)",
                 (claim_id, new_status, notes))
        
        conn.commit()
        conn.close()
        
        # Send email notification in background thread
        if user_email:
            def send_email_async():
                try:
                    if CELERY_AVAILABLE:
                        send_claim_notification(
                            user_email,
                            claim_number,
                            new_status,
                            notes or f"Your claim status has been updated to {new_status}"
                        )
                    else:
                        logger.info(f"[EMAIL] Claim status updated: {user_email} | {claim_number} - {new_status}")
                except Exception as e:
                    logger.warning(f"Failed to send email notification: {e}")
            
            # Send email in background thread to avoid blocking response
            email_thread = Thread(target=send_email_async, daemon=True)
            email_thread.start()
        
        return JSONResponse(content={"message": "Claim status updated", "status": new_status})
    except Exception as e:
        logger.exception("Error updating claim status")
        return JSONResponse(status_code=500, content={"message": "Error updating claim", "error": str(e)})


# ============= FRAUD DETECTION HELPER =============

def detect_fraud(claim_amount: float, claim_type: str, description: str, documents: List) -> tuple:
    """Rules-based fraud detection system"""
    fraud_score = 0
    flags = []
    
    # Rule 1: Unusually high claim amount
    threshold_amounts = {
        "Health": 500000,
        "Auto": 300000,
        "Home": 1000000,
        "Life": 2000000
    }
    
    if claim_amount > threshold_amounts.get(claim_type, 500000):
        fraud_score += 25
        flags.append("High claim amount")
    
    # Rule 2: Insufficient documentation
    if len(documents) < 2:
        fraud_score += 20
        flags.append("Insufficient documentation")
    
    # Rule 3: Suspicious keywords in description
    suspicious_keywords = ["total loss", "complete damage", "stolen", "fire", "accident"]
    if any(keyword in description.lower() for keyword in suspicious_keywords):
        fraud_score += 10
        flags.append("High-risk incident type")
    
    # Rule 4: Very short description (less than 20 characters)
    if len(description) < 20:
        fraud_score += 15
        flags.append("Insufficient details provided")
    
    # Rule 5: Round number claims (potential indicator)
    if claim_amount % 10000 == 0 and claim_amount > 50000:
        fraud_score += 10
        flags.append("Round number claim amount")
    
    return min(fraud_score, 100), flags


# ============= ADMIN ENDPOINTS =============

@app.get("/api/admin/all-claims")
async def get_all_claims():
    """Get all claims (admin only)"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("""SELECT id, claim_number, user_id, policy_type, claim_type, claim_amount, 
                    status, fraud_score, created_at, incident_date, description
                    FROM claims 
                    ORDER BY created_at DESC""")
        
        claims = []
        for row in c.fetchall():
            claims.append({
                "id": row[0],
                "claim_number": row[1],
                "user_id": row[2],
                "policy_type": row[3],
                "claim_type": row[4],
                "claim_amount": row[5],
                "status": row[6],
                "fraud_score": row[7],
                "created_at": row[8],
                "incident_date": row[9],
                "description": row[10]
            })
        
        conn.close()
        return JSONResponse(content={"claims": claims})
    except Exception as e:
        logger.exception("Error fetching all claims")
        return JSONResponse(status_code=500, content={"message": "Error fetching claims", "error": str(e)})


@app.get("/api/admin/all-users")
async def get_all_users():
    """Get all registered users (admin only)"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("""SELECT id, name, email, username, mobile, is_active, created_at
                    FROM users 
                    ORDER BY created_at DESC""")
        
        users = []
        for row in c.fetchall():
            users.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "username": row[3],
                "mobile": row[4],
                "is_active": True if row[5] else False,
                "created_at": row[6]
            })
        
        conn.close()
        return JSONResponse(content={"users": users})
    except Exception as e:
        logger.exception("Error fetching all users")
        return JSONResponse(status_code=500, content={"message": "Error fetching users", "error": str(e)})


@app.get("/api/admin/statistics")
async def get_admin_statistics():
    """Get admin dashboard statistics"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        # Get claims statistics
        c.execute("SELECT COUNT(*) FROM claims")
        total_claims = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM claims WHERE status IN ('Submitted', 'Under Review')")
        pending_claims = c.fetchone()[0]
        
        c.execute("SELECT SUM(claim_amount) FROM claims")
        total_claim_amount = c.fetchone()[0] or 0
        
        # Get users statistics
        c.execute("SELECT COUNT(*) FROM users")
        total_users = c.fetchone()[0]
        
        # Get policies statistics
        c.execute("SELECT COUNT(*) FROM insurance_policies")
        total_policies = c.fetchone()[0]
        
        # Get claims by type
        c.execute("""SELECT claim_type, COUNT(*) as count 
                    FROM claims GROUP BY claim_type""")
        claims_by_type = {row[0]: row[1] for row in c.fetchall()}
        
        # Get claims by status
        c.execute("""SELECT status, COUNT(*) as count 
                    FROM claims GROUP BY status""")
        claims_by_status = {row[0]: row[1] for row in c.fetchall()}
        
        # Get high fraud score claims
        c.execute("""SELECT COUNT(*) FROM claims WHERE fraud_score > 70""")
        high_fraud_claims = c.fetchone()[0]
        
        conn.close()
        
        return JSONResponse(content={
            "total_claims": total_claims,
            "pending_claims": pending_claims,
            "total_claim_amount": total_claim_amount,
            "total_users": total_users,
            "total_policies": total_policies,
            "claims_by_type": claims_by_type,
            "claims_by_status": claims_by_status,
            "high_fraud_claims": high_fraud_claims
        })
    except Exception as e:
        logger.exception("Error fetching statistics")
        return JSONResponse(status_code=500, content={"message": "Error fetching statistics", "error": str(e)})


@app.post("/api/admin/policies")
async def create_policy(request: Request):
    """Create a new insurance policy (admin only)"""
    try:
        data = await request.json()
        
        required_fields = [
            "policy_name", "policy_type", "provider", "coverage_amount",
            "premium_monthly", "premium_yearly", "deductible"
        ]
        
        if not all(field in data for field in required_fields):
            return JSONResponse(status_code=400, content={"message": "Missing required fields"})
        
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("""INSERT INTO insurance_policies 
                    (policy_name, policy_type, provider, coverage_amount, 
                     premium_monthly, premium_yearly, deductible, features, rating, description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                 (data["policy_name"], data["policy_type"], data["provider"],
                  data["coverage_amount"], data["premium_monthly"], data["premium_yearly"],
                  data["deductible"], json.dumps(data.get("features", [])),
                  data.get("rating", 0), data.get("description", "")))
        
        policy_id = c.lastrowid
        conn.commit()
        conn.close()
        
        return JSONResponse(status_code=201, content={
            "message": "Policy created successfully",
            "policy_id": policy_id
        })
    except Exception as e:
        logger.exception("Error creating policy")
        return JSONResponse(status_code=500, content={"message": "Error creating policy", "error": str(e)})


@app.put("/api/admin/policies/{policy_id}")
async def update_policy(policy_id: int, request: Request):
    """Update an insurance policy (admin only)"""
    try:
        data = await request.json()
        
        conn = connect_db()
        c = conn.cursor()
        
        update_fields = []
        values = []
        
        field_mapping = {
            "policy_name": "policy_name",
            "policy_type": "policy_type",
            "provider": "provider",
            "coverage_amount": "coverage_amount",
            "premium_monthly": "premium_monthly",
            "premium_yearly": "premium_yearly",
            "deductible": "deductible",
            "rating": "rating",
            "description": "description"
        }
        
        for key, db_field in field_mapping.items():
            if key in data:
                update_fields.append(f"{db_field} = ?")
                values.append(data[key])
        
        if not update_fields:
            conn.close()
            return JSONResponse(status_code=400, content={"message": "No fields to update"})
        
        values.append(policy_id)
        query = f"UPDATE insurance_policies SET {', '.join(update_fields)} WHERE id = ?"
        c.execute(query, values)
        
        conn.commit()
        conn.close()
        
        return JSONResponse(content={"message": "Policy updated successfully"})
    except Exception as e:
        logger.exception("Error updating policy")
        return JSONResponse(status_code=500, content={"message": "Error updating policy", "error": str(e)})


@app.delete("/api/admin/policies/{policy_id}")
async def delete_policy(policy_id: int):
    """Delete an insurance policy (admin only)"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("DELETE FROM insurance_policies WHERE id = ?", (policy_id,))
        conn.commit()
        conn.close()
        
        return JSONResponse(content={"message": "Policy deleted successfully"})
    except Exception as e:
        logger.exception("Error deleting policy")
        return JSONResponse(status_code=500, content={"message": "Error deleting policy", "error": str(e)})


@app.get("/api/admin/claims-report")
async def get_claims_report():
    """Get detailed claims report for admin"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        # Total claims and amounts by type
        c.execute("""SELECT claim_type, COUNT(*) as count, SUM(claim_amount) as total_amount,
                    AVG(fraud_score) as avg_fraud_score
                    FROM claims GROUP BY claim_type""")
        
        report_by_type = []
        for row in c.fetchall():
            report_by_type.append({
                "claim_type": row[0],
                "count": row[1],
                "total_amount": row[2],
                "avg_fraud_score": round(row[3], 2) if row[3] else 0
            })
        
        # Claims by status
        c.execute("""SELECT status, COUNT(*) as count, SUM(claim_amount) as total_amount
                    FROM claims GROUP BY status""")
        
        report_by_status = []
        for row in c.fetchall():
            report_by_status.append({
                "status": row[0],
                "count": row[1],
                "total_amount": row[2]
            })
        
        conn.close()
        
        return JSONResponse(content={
            "report_by_type": report_by_type,
            "report_by_status": report_by_status
        })
    except Exception as e:
        logger.exception("Error generating claims report")
        return JSONResponse(status_code=500, content={"message": "Error generating report", "error": str(e)})


# ==================== NOTIFICATION PREFERENCES ====================

@app.get("/api/users/{user_id}/notification-preferences")
async def get_notification_preferences(user_id: int, token: str = None):
    """Get user's notification preferences"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        c.execute("""SELECT notify_claim_updates, notify_policy_updates, notify_promotions 
                    FROM users WHERE id = ?""", (user_id,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        return {
            "notify_claim_updates": bool(row[0]),
            "notify_policy_updates": bool(row[1]),
            "notify_promotions": bool(row[2])
        }
    except Exception as e:
        logger.exception("Error getting notification preferences")
        return JSONResponse(status_code=500, content={"message": "Error fetching preferences"})


@app.post("/api/users/{user_id}/notification-preferences")
async def update_notification_preferences(user_id: int, payload: dict):
    """Update user's notification preferences"""
    try:
        conn = connect_db()
        c = conn.cursor()
        
        notify_claim = payload.get("notify_claim_updates", True)
        notify_policy = payload.get("notify_policy_updates", True)
        notify_promo = payload.get("notify_promotions", False)
        
        c.execute("""UPDATE users 
                    SET notify_claim_updates = ?, 
                        notify_policy_updates = ?, 
                        notify_promotions = ? 
                    WHERE id = ?""",
                 (1 if notify_claim else 0,
                  1 if notify_policy else 0,
                  1 if notify_promo else 0,
                  user_id))
        
        conn.commit()
        conn.close()
        
        return {"message": "Preferences updated successfully"}
    except Exception as e:
        logger.exception("Error updating notification preferences")
        return JSONResponse(status_code=500, content={"message": "Error updating preferences"})


# ==================== ADMIN: SEND POLICY UPDATES ====================

@app.post("/api/admin/send-policy-update")
async def send_policy_update(payload: dict):
    """
    Admin endpoint to send policy update notifications to users
    """
    try:
        policy_name = payload.get("policy_name", "")
        update_type = payload.get("update_type", "")
        details = payload.get("details", "")
        target_users = payload.get("target_users", None)
        
        if not policy_name or not update_type:
            return JSONResponse(status_code=400, content={"message": "policy_name and update_type are required"})
        
        conn = connect_db()
        c = conn.cursor()
        
        # Get users to notify
        if target_users and len(target_users) > 0:
            placeholders = ','.join(['?' * len(target_users)])
            c.execute(f"""SELECT DISTINCT email FROM users 
                         WHERE id IN ({','.join(['?'] * len(target_users))}) 
                         AND notify_policy_updates = 1""", target_users)
        else:
            # Get all users with policy notifications enabled
            c.execute("""SELECT DISTINCT email FROM users 
                        WHERE notify_policy_updates = 1""")
        
        user_emails = [row[0] for row in c.fetchall()]
        conn.close()
        
        if not user_emails:
            return JSONResponse(status_code=400, content={"message": "No users to notify"})
        
        # Send emails
        if CELERY_AVAILABLE:
            from .tasks import send_bulk_policy_notification
            send_bulk_policy_notification.delay(user_emails, policy_name, update_type, details)
            return {
                "message": "Notifications queued for sending",
                "recipients_count": len(user_emails)
            }
        else:
            from .tasks import send_policy_update_email
            failed = 0
            for email in user_emails:
                try:
                    send_policy_update_email(email, policy_name, update_type, details)
                except:
                    failed += 1
            
            return {
                "message": "Notifications sent",
                "recipients_count": len(user_emails),
                "failed_count": failed
            }
    
    except Exception as e:
        logger.exception("Error sending policy update")
        return JSONResponse(status_code=500, content={"message": "Error sending notifications"})


@app.post("/api/admin/send-claim-update")
async def send_claim_update_admin(payload: dict):
    """
    Admin endpoint to send claim status updates to users
    """
    try:
        claim_id = payload.get("claim_id")
        status = payload.get("status", "")
        notes = payload.get("notes", "")
        
        if not claim_id or not status:
            return JSONResponse(status_code=400, content={"message": "claim_id and status are required"})
        
        conn = connect_db()
        c = conn.cursor()
        
        # Get claim and user info
        c.execute("""SELECT claim_number, email, notify_claim_updates 
                    FROM claims cl
                    JOIN users u ON cl.user_id = u.id 
                    WHERE cl.id = ?""", (claim_id,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            return JSONResponse(status_code=404, content={"message": "Claim not found"})
        
        claim_number, user_email, should_notify = row
        
        if not should_notify:
            return {
                "message": "User has disabled claim notifications",
                "sent": False
            }
        
        # Send email
        if CELERY_AVAILABLE:
            send_claim_notification.delay(user_email, claim_number, status, notes)
            return {
                "message": "Claim update notification queued",
                "sent": True
            }
        else:
            send_claim_notification(user_email, claim_number, status, notes)
            return {
                "message": "Claim update notification sent",
                "sent": True
            }
    
    except Exception as e:
        logger.exception("Error sending claim update")
        return JSONResponse(status_code=500, content={"message": "Error sending notification"})


# ==================== USER: VIEW NOTIFICATION HISTORY ====================

@app.get("/api/users/{user_id}/notifications")
async def get_user_notifications(user_id: int, skip: int = 0, limit: int = 20):
    """
    Get user's notification history
    """
    try:
        conn = connect_db()
        c = conn.cursor()
        
        # Get recent claim updates
        c.execute("""SELECT 'claim' as type, claim_number as title, status, 
                    '' as notes, created_at
                    FROM claims 
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT ?""", (user_id, limit))
        
        notifications = []
        for row in c.fetchall():
            notifications.append({
                "type": row[0],
                "title": row[1],
                "status": row[2],
                "details": row[3],
                "timestamp": row[4]
            })
        
        conn.close()
        return notifications
    
    except Exception as e:
        logger.exception("Error fetching notifications")
        return JSONResponse(status_code=500, content={"message": "Error fetching notifications"})
