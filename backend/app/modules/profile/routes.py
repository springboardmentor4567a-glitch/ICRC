from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.auth.models import User, Notification
from app.modules.policies.models import UserPolicy
from app.modules.claims.models import Claim

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user: return jsonify({"message": "User not found"}), 404

    policies = UserPolicy.query.filter_by(user_id=user_id).order_by(UserPolicy.start_date.desc()).all()
    policy_list = [{
        "id": p.id,
        "policy_id": p.policy_id,
        "policy_number": p.policy_number,
        "title": p.policy.title if p.policy else "Unknown",
        "provider": p.policy.provider.name if p.policy and p.policy.provider else "Unknown",
        "start_date": p.start_date.strftime('%Y-%m-%d'),
        "end_date": p.end_date.strftime('%Y-%m-%d'),
        "premium": p.premium_amount,
        "coverage": p.coverage_amount,
        "status": p.status
    } for p in policies]

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

    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    notif_list = [{"id": n.id, "title": n.title, "message": n.message, "date": n.created_at.strftime('%Y-%m-%d %H:%M')} for n in notifs]

    return jsonify({
        "user": {"name": user.name, "email": user.email, "risk_profile": user.risk_profile or {}},
        "policies": policy_list,
        "claims": claim_list,
        "notifications": notif_list
    }), 200