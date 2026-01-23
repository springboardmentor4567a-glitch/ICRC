from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Text, Boolean, JSON, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import bcrypt
import jwt
import os
from time import time

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), default='user')  # user or admin
    risk_profile = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    rating = Column(Float, default=0.0)
    contact_email = Column(String(120))
    contact_phone = Column(String(20))
    website = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

class Policy(db.Model):
    __tablename__ = 'policies'

    id = Column(Integer, primary_key=True)
    provider_id = Column(Integer, ForeignKey('providers.id'), nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # life, health, auto, home, travel
    category = Column(String(50), nullable=False)
    coverage = Column(JSON, default=dict)
    base_premium = Column(Float, nullable=False)
    term_months = Column(Integer)
    deductible = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    features = Column(JSON, default=list)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    provider = relationship('Provider', backref='policies')

class UserPolicy(db.Model):
    __tablename__ = 'user_policies'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    policy_id = Column(Integer, ForeignKey('policies.id'), nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    start_date = Column(Date)
    end_date = Column(Date)
    premium_amount = Column(Float)
    coverage_amount = Column(Float)
    status = Column(String(20), default='active')  # active, expired, cancelled
    customizations = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', backref='user_policies')
    policy = relationship('Policy', backref='user_policies')

class Claim(db.Model):
    __tablename__ = 'claims'

    id = Column(Integer, primary_key=True)
    user_policy_id = Column(Integer, ForeignKey('user_policies.id'), nullable=False)
    claim_number = Column(String(20), unique=True, nullable=False)
    claim_type = Column(String(50), nullable=False)  # accident, illness, theft, etc.
    incident_date = Column(Date, nullable=False)
    amount_claimed = Column(Float, nullable=False)
    description = Column(Text)  # Description of the incident
    status = Column(Enum('submitted', 'processing', 'approved', 'rejected', 'paid', 'under_review', name='claim_status'), default='submitted')
    fraud_score = Column(Float, default=0.0)  # Fraud detection score (0.0 to 1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_policy = relationship('UserPolicy', backref='claims')

class ClaimDocument(db.Model):
    __tablename__ = 'claim_documents'

    id = Column(Integer, primary_key=True)
    claim_id = Column(Integer, ForeignKey('claims.id'), nullable=False)
    document_type = Column(String(50), nullable=False)  # police_report, medical_report, etc.
    file_name = Column(String(255), nullable=False)
    s3_key = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship('Claim', backref='documents')

class ClaimStatusHistory(db.Model):
    __tablename__ = 'claim_status_history'

    id = Column(Integer, primary_key=True)
    claim_id = Column(Integer, ForeignKey('claims.id'), nullable=False)
    status = Column(Enum('submitted', 'processing', 'approved', 'rejected', 'paid', 'under_review', name='claim_status'), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship('Claim', backref='status_history')

class FraudFlag(db.Model):
    __tablename__ = 'fraud_flags'

    id = Column(Integer, primary_key=True)
    claim_id = Column(Integer, ForeignKey('claims.id'), nullable=False)
    flag_type = Column(String(50), nullable=False)  # duplicate_docs, suspicious_timing, amount_anomaly
    severity = Column(String(20), nullable=False)  # low, medium, high
    description = Column(Text, nullable=False)
    flagged_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)
    resolved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    claim = relationship('Claim', backref='fraud_flags')
    resolver = relationship('User', backref='resolved_flags')

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    policy_id = Column(Integer, ForeignKey('policies.id'), nullable=False)
    score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', backref='recommendations')
    policy = relationship('Policy', backref='recommendations')
