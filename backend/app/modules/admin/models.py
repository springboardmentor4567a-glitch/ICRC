from app.extensions import db
from datetime import datetime

class AdminLog(db.Model):
    __tablename__ = 'admin_logs'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)