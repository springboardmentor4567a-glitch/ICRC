from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random

# ✅ IMPORTS
from app.extensions import db
from app.modules.policies.models import Policy, UserPolicy
from app.modules.auth.models import Notification, User
from app.modules.claims.models import Claim
# ✅ EMAIL SERVICE IMPORT
from app.utils.email_service import send_notification_email 

policies_bp = Blueprint('policies', __name__)

@policies_bp.route('', methods=['GET']) 
def get_all_policies():
    """Fetch all available policies for the catalog."""
    policies = Policy.query.all()
    # Ensure to_dict() handles the new Provider relationship safely
    return jsonify([p.to_dict() for p in policies]), 200

@policies_bp.route('/my-policies', methods=['GET'])
@jwt_required()
def get_my_policies():
    """Fetch policies purchased by the logged-in user."""
    user_id = get_jwt_identity()
    policies = UserPolicy.query.filter_by(user_id=user_id).all()
    
    result = []
    for p in policies:
        # Safety check if policy or provider data is missing
        policy_title = p.policy.title if p.policy else "Unknown Policy"
        provider_name = "Unknown"
        if p.policy and p.policy.provider_data:
            provider_name = p.policy.provider_data.name
        
        result.append({
            "id": p.id,
            "policy_id": p.policy_id,
            "policy_number": p.policy_number,
            "title": policy_title,
            "provider": provider_name,
            "coverage_amount": p.coverage_amount,
            "remaining_balance": p.remaining_sum_insured, 
            "start_date": p.start_date.strftime('%Y-%m-%d'),
            "end_date": p.end_date.strftime('%Y-%m-%d') if p.end_date else None,
            "status": p.status
        })
        
    return jsonify(result), 200

@policies_bp.route('/buy', methods=['POST'])
@jwt_required()
def buy_policy():
    """Handle policy purchase."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        policy_id = data.get('policy_id')
        
        # Default to 5L if not provided, ensure float
        coverage_amount = float(data.get('coverage_amount', 500000))

        # Check if user already has this active policy
        existing = UserPolicy.query.filter_by(user_id=user_id, policy_id=policy_id, status='active').first()
        if existing: 
            return jsonify({"message": "You already have this active policy"}), 400

        policy = Policy.query.get(policy_id)
        if not policy: 
            return jsonify({"message": "Policy not found"}), 404

        # Recalculate Premium (Security Best Practice)
        # Using simple multiplier logic: (Requested / Base 5L) * BasePremium
        base_coverage = 500000.0
        base_premium = float(policy.premium)
        final_premium = base_premium * (coverage_amount / base_coverage)
        
        # Generate Policy Number
        new_pol_num = f"POL-{random.randint(10000, 99999)}"
        end_date = datetime.utcnow() + timedelta(days=365)

        new_policy = UserPolicy(
            user_id=user_id,
            policy_id=policy_id,
            policy_number=new_pol_num,
            start_date=datetime.utcnow(),
            end_date=end_date,
            premium_amount=round(final_premium, 2),
            coverage_amount=coverage_amount,
            remaining_sum_insured=coverage_amount,
            status='active'
        )
        
        db.session.add(new_policy)
        
        # Add Database Notification
        db.session.add(Notification(user_id=user_id, title="Purchased", message=f"Successfully bought {policy.title}"))
        
        db.session.commit()

        # ✅ SEND "PURCHASE" EMAIL
        user = User.query.get(user_id)
        if user and user.email:
            send_notification_email(
                to_email=user.email,
                user_name=user.name,
                type='policy_purchased',
                details={
                    'policy_title': policy.title,
                    'policy_number': new_pol_num,
                    'premium': f"{round(final_premium, 2):,.2f}",
                    'end_date': end_date.strftime('%Y-%m-%d')
                }
            )

        return jsonify({
            "message": "Purchase successful & Email Sent", 
            "policy_number": new_policy.policy_number,
            "charged_premium": new_policy.premium_amount
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@policies_bp.route('/cancel/<int:user_policy_id>', methods=['PUT'])
@jwt_required()
def cancel_policy(user_policy_id):
    """Cancel a user's policy."""
    try:
        user_id = get_jwt_identity()
        user_policy = UserPolicy.query.filter_by(id=user_policy_id, user_id=user_id).first()
        
        if not user_policy: 
            return jsonify({"message": "Policy not found"}), 404
            
        if user_policy.status == 'cancelled': 
            return jsonify({"message": "Already cancelled"}), 400

        # Auto-reject pending claims associated with this policy
        pending_claims = Claim.query.filter(
            Claim.user_policy_id == user_policy.id, 
            Claim.status.in_(['Submitted', 'under_review'])
        ).all()
        
        for claim in pending_claims:
            claim.status = 'Rejected'
            claim.admin_comments = "Auto-rejected due to policy cancellation"

        user_policy.status = 'cancelled'
        
        # Update User Stats (if cancel_count exists)
        user = User.query.get(user_id)
        if hasattr(user, 'cancel_count'):
            user.cancel_count = (user.cancel_count or 0) + 1
            user.last_cancel_at = datetime.utcnow()

        # Database Notification
        db.session.add(Notification(user_id=user_id, title="Cancelled", message=f"Policy {user_policy.policy_number} cancelled"))
        db.session.commit()

        # ✅ SEND "CANCEL" EMAIL
        if user and user.email:
            policy_title = user_policy.policy.title if user_policy.policy else "Unknown Policy"
            send_notification_email(
                to_email=user.email,
                user_name=user.name,
                type='policy_cancelled',
                details={
                    'policy_title': policy_title,
                    'refund_status': "Initiated (5-7 business days)"
                }
            )

        return jsonify({"message": "Policy Cancelled & Email Sent"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@policies_bp.route('/pay-premium/<int:user_policy_id>', methods=['POST'])
@jwt_required()
def pay_premium(user_policy_id):
    """Mock payment endpoint."""
    db.session.add(Notification(user_id=get_jwt_identity(), title="Premium Paid", message="Payment received successfully"))
    db.session.commit()
    return jsonify({"message": "Payment successful"}), 200