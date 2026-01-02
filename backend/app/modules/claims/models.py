from app.extensions import db
from datetime import datetime

class Claim(db.Model):
    __tablename__ = 'claims'
    id = db.Column(db.Integer, primary_key=True)
    user_policy_id = db.Column(db.Integer, db.ForeignKey('user_policies.id'))
    claim_number = db.Column(db.String(50), unique=True)
    incident_date = db.Column(db.Date)
    incident_description = db.Column(db.Text)
    claim_amount = db.Column(db.Float)
    approved_amount = db.Column(db.Float)
    status = db.Column(db.String(20), default='Submitted')
    admin_comments = db.Column(db.Text)
    claim_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user_policy = db.relationship('UserPolicy', backref='claims')
    documents = db.relationship('ClaimDocument', backref='claim', cascade="all, delete")
    fraud_flags = db.relationship('FraudFlag', backref='claim', cascade="all, delete")

class ClaimDocument(db.Model):
    __tablename__ = 'claim_documents'
    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'))
    file_name = db.Column(db.String(255))
    file_path = db.Column(db.String(512))
    document_type = db.Column(db.String(50))

class FraudFlag(db.Model):
    __tablename__ = 'fraud_flags'
    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'))
    rule_code = db.Column(db.String(100))
    severity = db.Column(db.String(10))
    details = db.Column(db.Text)
    is_ignored = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)