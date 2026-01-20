from app.extensions import db
from datetime import datetime

class AdminLog(db.Model):
    __tablename__ = 'admin_logs'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(255))
    target_type = db.Column(db.String(50)) # e.g., "User", "Claim"
    target_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)