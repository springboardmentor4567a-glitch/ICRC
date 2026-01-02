from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random

# ✅ FIXED IMPORTS
from app.extensions import db
from app.modules.policies.models import Policy, UserPolicy
from app.modules.auth.models import Notification, User
from app.modules.claims.models import Claim

policies_bp = Blueprint('policies', __name__)

@policies_bp.route('', methods=['GET']) 
def get_all_policies():
    policies = Policy.query.all()
    return jsonify([p.to_dict() for p in policies]), 200

@policies_bp.route('/my-policies', methods=['GET'])
@jwt_required()
def get_my_policies():
    user_id = get_jwt_identity()
    policies = UserPolicy.query.filter_by(user_id=user_id).all()
    result = [{
        "id": p.id,
        "policy_id": p.policy_id,
        "policy_number": p.policy_number,
        "title": p.policy.title if p.policy else "Unknown",
        "provider": p.policy.provider.name if p.policy and p.policy.provider else "Unknown",
        "coverage_amount": p.coverage_amount,
        "remaining_amount": p.remaining_sum_insured,
        "start_date": p.start_date.strftime('%Y-%m-%d'),
        "end_date": p.end_date.strftime('%Y-%m-%d'),
        "status": p.status
    } for p in policies]
    return jsonify(result), 200

@policies_bp.route('/buy', methods=['POST'])
@jwt_required()
def buy_policy():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        policy_id = data.get('policy_id')
        coverage_amount = float(data.get('coverage_amount', 500000))

        existing = UserPolicy.query.filter_by(user_id=user_id, policy_id=policy_id, status='active').first()
        if existing: return jsonify({"message": "You already have this active policy"}), 400

        policy = Policy.query.get(policy_id)
        if not policy: return jsonify({"message": "Policy not found"}), 404

        new_policy = UserPolicy(
            user_id=user_id,
            policy_id=policy_id,
            policy_number=f"POL-{random.randint(10000, 99999)}",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=365),
            premium_amount=policy.premium,
            coverage_amount=coverage_amount,
            remaining_sum_insured=coverage_amount,
            status='active'
        )
        db.session.add(new_policy)
        db.session.add(Notification(user_id=user_id, title="Purchased", message=f"Bought {policy.title}"))
        db.session.commit()
        return jsonify({"message": "Purchase successful", "policy_number": new_policy.policy_number}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@policies_bp.route('/cancel/<int:user_policy_id>', methods=['PUT'])
@jwt_required()
def cancel_policy(user_policy_id):
    try:
        user_id = get_jwt_identity()
        user_policy = UserPolicy.query.filter_by(id=user_policy_id, user_id=user_id).first()
        if not user_policy: return jsonify({"message": "Policy not found"}), 404
        if user_policy.status == 'cancelled': return jsonify({"message": "Already cancelled"}), 400

        pending_claims = Claim.query.filter(Claim.user_policy_id == user_policy.id, Claim.status.in_(['Submitted', 'under_review'])).all()
        for claim in pending_claims:
            claim.status = 'Rejected'
            claim.admin_comments = "Auto-rejected due to policy cancellation"

        user_policy.status = 'cancelled'
        user = User.query.get(user_id)
        if user:
            user.cancel_count = (user.cancel_count or 0) + 1
            user.last_cancel_at = datetime.utcnow()

        db.session.add(Notification(user_id=user_id, title="Cancelled", message=f"Policy {user_policy.policy_number} cancelled"))
        db.session.commit()
        return jsonify({"message": "Cancelled"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@policies_bp.route('/pay-premium/<int:user_policy_id>', methods=['POST'])
@jwt_required()
def pay_premium(user_policy_id):
    db.session.add(Notification(user_id=get_jwt_identity(), title="Premium Paid", message="Payment received"))
    db.session.commit()
    return jsonify({"message": "Payment successful"}), 200