from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models import db, Policy, UserPolicy, Notification, Claim

policies_bp = Blueprint('policies', __name__)

# --- GET ALL POLICIES ---
@policies_bp.route('', methods=['GET']) 
def get_all_policies():
    try:
        policies = Policy.query.all()
        return jsonify([p.to_dict() for p in policies]), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch policies"}), 500

# --- BUY POLICY ---
@policies_bp.route('/buy', methods=['POST'])
@jwt_required()
def buy_policy():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        policy_id = data.get('policy_id')
        coverage_amount = float(data.get('coverage_amount', 500000))

        existing = UserPolicy.query.filter_by(
            user_id=user_id, policy_id=policy_id, status='active'
        ).first()
        
        if existing:
            return jsonify({"message": "You already have this active policy"}), 400

        policy = Policy.query.get(policy_id)
        if not policy:
            return jsonify({"message": "Policy not found"}), 404

        start_date = datetime.utcnow()
        end_date = datetime(start_date.year + 1, start_date.month, start_date.day)
        
        import random
        policy_number = f"POL-{random.randint(10000, 99999)}"

        new_policy = UserPolicy(
            user_id=user_id,
            policy_id=policy_id,
            policy_number=policy_number,
            start_date=start_date,
            end_date=end_date,
            premium_amount=policy.premium,
            coverage_amount=coverage_amount,
            remaining_sum_insured=coverage_amount, # Initialize Balance
            status='active'
        )

        notif = Notification(
            user_id=user_id,
            title="Policy Purchased",
            message=f"You have successfully purchased {policy.title}. Sum Insured: ₹{coverage_amount:,.2f}"
        )

        db.session.add(new_policy)
        db.session.add(notif)
        db.session.commit()

        return jsonify({
            "message": "Purchase successful",
            "policy_number": policy_number
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Buy Error: {e}")
        return jsonify({"message": "Purchase failed"}), 500

# --- CANCEL POLICY (Smart Revoke Logic) ---
@policies_bp.route('/cancel/<int:user_policy_id>', methods=['PUT'])
@jwt_required()
def cancel_policy(user_policy_id):
    try:
        user_id = get_jwt_identity()
        user_policy = UserPolicy.query.filter_by(id=user_policy_id, user_id=user_id).first()

        if not user_policy:
            return jsonify({"message": "Policy not found"}), 404
        
        if user_policy.status == 'cancelled':
            return jsonify({"message": "Policy is already cancelled"}), 400

        # ✅ 1. Check for Pending Claims
        pending_claims = Claim.query.filter(
            Claim.user_policy_id == user_policy.id,
            Claim.status.in_(['Submitted', 'In Review'])
        ).all()

        revoked_count = 0
        if pending_claims:
            for claim in pending_claims:
                claim.status = 'Rejected'
                claim.admin_comments = "Auto-rejected: Policy cancelled by user."
                revoked_count += 1
        
        # ✅ 2. Cancel Policy
        user_policy.status = 'cancelled'
        
        # ✅ 3. Notify User
        msg = f"Your policy {user_policy.policy.title} has been cancelled."
        if revoked_count > 0:
            msg += f" WARNING: {revoked_count} pending claim(s) were automatically revoked."

        notif = Notification(
            user_id=user_id,
            title="Policy Cancelled",
            message=msg
        )
        db.session.add(notif)
        db.session.commit()
        
        return jsonify({"message": "Policy cancelled successfully. Claims revoked if any."}), 200

    except Exception as e:
        db.session.rollback()
        print("Cancel Error", e)
        return jsonify({"message": "Cancellation failed"}), 500

# --- PAY PREMIUM (Mock) ---
@policies_bp.route('/pay-premium/<int:user_policy_id>', methods=['POST'])
@jwt_required()
def pay_premium(user_policy_id):
    try:
        user_id = get_jwt_identity()
        notif = Notification(user_id=user_id, title="Premium Paid", message="Payment received.")
        db.session.add(notif)
        db.session.commit()
        return jsonify({"message": "Payment successful"}), 200
    except:
        return jsonify({"message": "Payment failed"}), 500