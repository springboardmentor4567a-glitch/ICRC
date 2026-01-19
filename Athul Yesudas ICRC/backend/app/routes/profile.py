from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, UserPolicy, Claim, Notification

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        # 1. Fetch Policies (Safe Access)
        policies = UserPolicy.query.filter_by(user_id=user_id).order_by(UserPolicy.start_date.desc()).all()
        policy_list = []
        for p in policies:
            # Handle potential model version differences gracefully
            prem = getattr(p, 'premium_amount', getattr(p, 'premium', 0))
            cov = getattr(p, 'coverage_amount', getattr(p, 'coverage', 0))

            policy_list.append({
                "id": p.id,
                "policy_id": p.policy_id, # Required for frontend "Active" check
                "policy_number": p.policy_number,
                "title": p.policy.title,
                "provider": p.policy.provider.name,
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
            "policy": c.user_policy.policy.title,
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

        return jsonify({
            "user": {
                "name": user.name,
                "email": user.email,
                "risk_profile": user.risk_profile or {} 
            },
            "policies": policy_list,
            "claims": claim_list,
            "notifications": notif_list
        }), 200

    except Exception as e:
        print(f"Profile Error: {e}")
        return jsonify({"message": "Server error loading profile"}), 500