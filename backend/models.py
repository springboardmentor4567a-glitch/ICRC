from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import jwt
import os
from time import time

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')  # user or admin
    risk_profile = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def generate_token(self):
        payload = {
            'user_id': self.id,
            'email': self.email,
            'role': self.role,
            'exp': int(time()) + 86400  # 24 hours
        }
        return jwt.encode(payload, os.getenv('SECRET_KEY', 'your-secret-key'), algorithm='HS256')

class Provider(db.Model):
    __tablename__ = 'providers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    rating = db.Column(db.Float, default=0.0)
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Policy(db.Model):
    __tablename__ = 'policies'

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # life, health, auto, home, travel
    category = db.Column(db.String(50), nullable=False)
    coverage = db.Column(db.JSON, default=dict)
    base_premium = db.Column(db.Float, nullable=False)
    term_months = db.Column(db.Integer)
    deductible = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Float, default=0.0)
    features = db.Column(db.JSON, default=list)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    provider = db.relationship('Provider', backref=db.backref('policies', lazy=True))

class UserPolicy(db.Model):
    __tablename__ = 'user_policies'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    premium_amount = db.Column(db.Float)
    coverage_amount = db.Column(db.Float)
    status = db.Column(db.String(20), default='active')  # active, expired, cancelled
    customizations = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('user_policies', lazy=True))
    policy = db.relationship('Policy', backref=db.backref('user_policies', lazy=True))

class Claim(db.Model):
    __tablename__ = 'claims'

    id = db.Column(db.Integer, primary_key=True)
    user_policy_id = db.Column(db.Integer, db.ForeignKey('user_policies.id'), nullable=False)
    claim_number = db.Column(db.String(20), unique=True, nullable=False)
    claim_type = db.Column(db.String(50), nullable=False)  # accident, illness, theft, etc.
    incident_date = db.Column(db.DateTime, nullable=False)
    amount_claimed = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)  # Description of the incident
    status = db.Column(db.String(20), default='submitted')  # submitted, under_review, approved, rejected, paid
    fraud_score = db.Column(db.Float, default=0.0)  # Fraud detection score (0.0 to 1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_policy = db.relationship('UserPolicy', backref=db.backref('claims', lazy=True))

class ClaimDocument(db.Model):
    __tablename__ = 'claim_documents'

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)  # police_report, medical_report, etc.
    file_name = db.Column(db.String(255), nullable=False)
    s3_key = db.Column(db.String(500), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    claim = db.relationship('Claim', backref=db.backref('documents', lazy=True))

class ClaimStatusHistory(db.Model):
    __tablename__ = 'claim_status_history'

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # submitted, processing, approved, rejected
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    claim = db.relationship('Claim', backref=db.backref('status_history', lazy=True))

class FraudFlag(db.Model):
    __tablename__ = 'fraud_flags'

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'), nullable=False)
    flag_type = db.Column(db.String(50), nullable=False)  # duplicate_docs, suspicious_timing, amount_anomaly
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high
    description = db.Column(db.Text, nullable=False)
    flagged_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    claim = db.relationship('Claim', backref=db.backref('fraud_flags', lazy=True))
    resolver = db.relationship('User', backref=db.backref('resolved_flags', lazy=True))

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('recommendations', lazy=True))
    policy = db.relationship('Policy', backref=db.backref('recommendations', lazy=True))
