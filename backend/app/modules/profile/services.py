from app.extensions import db
from app.modules.auth.models import User, Notification
from app.modules.policies.models import UserPolicy
from app.modules.claims.models import Claim

class ProfileService:
    @staticmethod
    def get_dashboard_data(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")

        # 1. Fetch Policies
        policies = UserPolicy.query.filter_by(user_id=user_id).order_by(UserPolicy.start_date.desc()).all()
        policy_list = []
        for p in policies:
            # Safe attribute access
            prem = getattr(p, 'premium_amount', getattr(p, 'premium', 0))
            cov = getattr(p, 'coverage_amount', getattr(p, 'coverage', 0))

            policy_list.append({
                "id": p.id,
                "policy_id": p.policy_id, 
                "policy_number": p.policy_number,
                "title": p.policy.title if p.policy else "Unknown Policy",
                "provider": p.policy.provider.name if p.policy and p.policy.provider else "Unknown",
                "start_date": p.start_date.strftime('%Y-%m-%d'),
                "end_date": p.end_date.strftime('%Y-%m-%d'),
                "premium": prem,
                "coverage": cov,
                "status": p.status
            })

        # 2. Fetch Claims
        claims = Claim.query.join(UserPolicy).filter(UserPolicy.user_id == user_id).order_by(Claim.created_at.desc()).all()
        claim_list = [{
            "id": c.id,
            "claim_number": c.claim_number,
            "policy": c.user_policy.policy.title if c.user_policy.policy else "Unknown",
            "date": c.incident_date.strftime('%Y-%m-%d'),
            "amount": c.claim_amount,
            "status": c.status,
            "description": c.incident_description
        } for c in claims]

        # 3. Fetch Notifications
        notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
        notif_list = [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "date": n.created_at.strftime('%Y-%m-%d %H:%M')
        } for n in notifs]

        return {
            "user": {
                "name": user.name,
                "email": user.email,
                "risk_profile": user.risk_profile or {} 
            },
            "policies": policy_list,
            "claims": claim_list,
            "notifications": notif_list
        }

    @staticmethod
    def get_risk_profile(user_id):
        """Fetches only the risk profile JSON (Restores old risk.py functionality)"""
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        return user.risk_profile or {}

    @staticmethod
    def update_risk_profile(user_id, data):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Update the JSON field
        user.risk_profile = data
        db.session.commit()
        return user.risk_profile