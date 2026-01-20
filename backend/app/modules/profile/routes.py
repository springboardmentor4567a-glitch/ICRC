from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.auth.models import User
from app.modules.policies.models import UserPolicy
from app.modules.claims.models import Claim

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user: return jsonify({"message": "User not found"}), 404

    # 1. Fetch ONLY Active Policies
    active_policies = UserPolicy.query.filter_by(user_id=user_id, status='active').all()
    
    # Create a set of active IDs for filtering claims later
    active_policy_ids = {p.id for p in active_policies}

    policy_list = []
    for p in active_policies:
        prov_name = "Unknown"
        if p.policy and p.policy.provider_data:
            prov_name = p.policy.provider_data.name
            
        policy_list.append({
            "id": p.policy_id,       # Catalog ID (for buying new/recommendations)
            "user_policy_id": p.id,  # Ownership ID (for cancelling)
            "policy_number": p.policy_number,
            "title": p.policy.title if p.policy else "Unknown",
            "provider": prov_name,
            "coverage_amount": p.coverage_amount,
            "remaining": p.remaining_sum_insured,
            "end_date": p.end_date.strftime('%Y-%m-%d'),
            "status": p.status
        })

    # 2. Fetch Claims (Only for Active Policies)
    # We join UserPolicy to ensure we only get claims for this user
    all_claims = Claim.query.join(UserPolicy).filter(UserPolicy.user_id == user_id)\
        .order_by(Claim.created_at.desc()).all()
    
    claim_list = []
    for c in all_claims:
        # ✅ FILTER: Only show claims if the policy is still active
        if c.user_policy_id in active_policy_ids:
            claim_list.append({
                "claim_number": c.claim_number,
                "status": c.status,
                "amount": c.claim_amount,
                # ✅ SAFE ACCESS: Handle missing description gracefully
                "description": getattr(c, 'description', 'No description'), 
                "admin_comments": c.admin_comments,
                "date": c.incident_date.strftime('%Y-%m-%d'),
                "policy": c.user_policy.policy.title if c.user_policy and c.user_policy.policy else "Unknown",
                # ✅ CRITICAL: Send ID for Refile Button
                "policy_id": c.user_policy.policy_id if c.user_policy else None
            })

    return jsonify({
        "user": {"name": user.name, "email": user.email, "id": user.id},
        "policies": policy_list,
        "recent_claims": claim_list
    }), 200