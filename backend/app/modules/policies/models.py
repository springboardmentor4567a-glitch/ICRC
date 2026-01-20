from app.extensions import db
from datetime import datetime

class Provider(db.Model):
    __tablename__ = 'providers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(50), default="India")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    policies = db.relationship('Policy', backref='provider_data', lazy=True)

class Policy(db.Model):
    __tablename__ = 'policies'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=True)
    
    policy_type = db.Column(db.String(50)) 
    title = db.Column(db.String(200))
    premium = db.Column(db.Numeric(10, 2))
    term_months = db.Column(db.Integer)
    coverage = db.Column(db.JSON) 
    deductible = db.Column(db.Numeric(10, 2))
    waiting_period_days = db.Column(db.Integer, default=30)
    tnc_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user_policies = db.relationship('UserPolicy', back_populates='policy', lazy=True)

    def to_dict(self):
        # ✅ FIX: Calculate purchased_count dynamically
        count = len(self.user_policies) if self.user_policies else 0
        
        return {
            "id": self.id,
            "title": self.title,
            "provider": self.provider_data.name if self.provider_data else "Unknown",
            "provider_id": self.provider_id,
            "premium": float(self.premium),
            "type": self.policy_type,
            "term": f"{self.term_months} Months",
            "coverage": self.coverage,
            "deductible": float(self.deductible),
            "purchased_count": count # ✅ Added this for Admin Registry
        }

class UserPolicy(db.Model):
    __tablename__ = 'user_policies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'))
    policy_number = db.Column(db.String(50), unique=True)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    premium_amount = db.Column(db.Float)
    coverage_amount = db.Column(db.Float)
    remaining_sum_insured = db.Column(db.Float)
    status = db.Column(db.String(20), default='active')
    auto_renew = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='user_policies', lazy=True)
    policy = db.relationship('Policy', back_populates='user_policies')