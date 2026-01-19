from .extensions import db
from datetime import datetime

# --- 1. CORE TABLES ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    risk_profile = db.Column(db.JSON, nullable=True) 
    preferences = db.relationship('UserPreference', backref='user', uselist=False, lazy=True)

class Provider(db.Model):
    __tablename__ = 'providers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    policies = db.relationship('Policy', backref='provider', lazy=True)

class Policy(db.Model):
    __tablename__ = 'policies'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False)
    policy_type = db.Column(db.String(20), nullable=False) # 'life', 'health', 'auto'
    title = db.Column(db.String(150), nullable=False)
    coverage = db.Column(db.JSON, nullable=True) 
    premium = db.Column(db.Float, nullable=False)
    term_months = db.Column(db.Integer, nullable=False)
    deductible = db.Column(db.Float, default=0.0) # Standard deductible
    waiting_period_days = db.Column(db.Integer, default=30) # Real-world cooling period
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'provider': self.provider.name if self.provider else "Unknown",
            'type': self.policy_type,
            'title': self.title,
            'coverage': self.coverage,
            'premium': self.premium,
            'term': f"{self.term_months} Months",
            'deductible': self.deductible,
            'waiting_period': self.waiting_period_days
        }

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # ... (Keep existing fields like age, income, etc.) ...

# --- 2. TRANSACTION TABLES (Updated for Real-World Logic) ---

class UserPolicy(db.Model):
    __tablename__ = 'user_policies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=False)
    
    policy_number = db.Column(db.String(50), unique=True, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=False)
    
    # ✅ Financials
    premium_amount = db.Column(db.Float, nullable=False, default=0.0)
    coverage_amount = db.Column(db.Float, nullable=False, default=0.0)
    
    # ✅ REAL WORLD: Track Balance & Deductibles
    remaining_sum_insured = db.Column(db.Float, nullable=False, default=0.0) 
    applicable_deductible = db.Column(db.Float, default=0.0)
    ncb_rate = db.Column(db.Float, default=0.0) # No Claim Bonus %
    
    # ✅ REAL WORLD: Cooling Period
    waiting_period_end_date = db.Column(db.DateTime, nullable=True)

    status = db.Column(db.String(20), default='active') 
    
    user = db.relationship('User', backref='user_policies')
    policy = db.relationship('Policy')

class Claim(db.Model):
    __tablename__ = 'claims'
    id = db.Column(db.Integer, primary_key=True)
    user_policy_id = db.Column(db.Integer, db.ForeignKey('user_policies.id'), nullable=False)
    
    claim_number = db.Column(db.String(50), unique=True, nullable=False)
    incident_date = db.Column(db.Date, nullable=False)
    incident_description = db.Column(db.Text, nullable=False)
    
    claim_amount = db.Column(db.Float, nullable=False)
    
    # ✅ REAL WORLD: Settlement Details
    approved_amount = db.Column(db.Float, nullable=True)
    deduction_reason = db.Column(db.String(255), nullable=True) # e.g., "Copay deducted"
    
    status = db.Column(db.String(20), default='Submitted') 
    admin_comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_policy = db.relationship('UserPolicy', backref='claims')

class ClaimDocument(db.Model):
    __tablename__ = 'claim_documents'
    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    document_type = db.Column(db.String(50)) 
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100))
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)