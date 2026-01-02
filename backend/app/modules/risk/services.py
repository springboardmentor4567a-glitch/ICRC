from app.extensions import db
from app.modules.auth.models import User

class RiskService:
    @staticmethod
    def get_profile(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        return user.risk_profile or {}

    @staticmethod
    def update_profile(user_id, data):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Validation: Ensure data is a dictionary
        if not isinstance(data, dict):
            raise ValueError("Invalid profile data format")

        user.risk_profile = data
        db.session.commit()
        return user.risk_profile