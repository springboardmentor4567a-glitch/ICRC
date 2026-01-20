from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
import os

# ✅ IMPORTS
from app.extensions import db
from app.modules.auth.models import User, Notification
from app.modules.policies.models import Policy, UserPolicy
from app.modules.claims.models import Claim, FraudFlag
from app.modules.admin.models import AdminLog
# ✅ NEW IMPORT FOR EMAIL SERVICE
from app.utils.email_service import send_notification_email 

# Try-Except block for fraud engine to prevent crashes if module is missing
try:
    from app.modules.fraud.engine import run_fraud_checks
except ImportError:
    run_fraud_checks = lambda x: 0 # Fallback

admin_bp = Blueprint('admin', __name__)

# --- 🛡️ ADMIN AUTH DECORATOR ---
def require_admin(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
        except Exception:
            return jsonify({"message": "Missing Authorization Header"}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 401

        # Check Admin Rules
        is_icrc = user.email.lower().endswith('@icrc.com')
        admin_emails = os.getenv('ADMIN_EMAILS', '').split(',')
        is_env_admin = user.email.lower() in [e.strip().lower() for e in admin_emails if e.strip()]

        if not (user.is_admin or is_icrc or is_env_admin):
            return jsonify({"message": "Admin access required"}), 403

        if getattr(user, 'is_banned', False):
            return jsonify({"message": "Account banned"}), 403

        return fn(*args, **kwargs)
    return wrapper


# --- 📊 DASHBOARD STATS ---
@admin_bp.route('/dashboard', methods=['GET'])
@require_admin
def dashboard():
    users = User.query.filter(User.is_admin == False).count()
    policies = Policy.query.count()
    pending_claims = Claim.query.filter(Claim.status.in_(['Submitted', 'under_review', 'In Review'])).count()
    flags = FraudFlag.query.count()
    
    return jsonify({
        "users": users,
        "policies": policies,
        "pending_claims": pending_claims,
        "fraud_flags": flags
    }), 200


# --- 🔍 CLAIMS MANAGEMENT (Optimized) ---
@admin_bp.route('/claims', methods=['GET'])
@require_admin
def list_claims():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    status = request.args.get('status')
    qtext = request.args.get('q', '').strip()
    severity = request.args.get('severity', '').strip().lower()
    
    # ✅ OPTIMIZATION: Pre-load UserPolicy and User to prevent N+1 queries
    query = Claim.query.options(
        joinedload(Claim.user_policy).joinedload(UserPolicy.user)
    )

    if status: 
        query = query.filter(Claim.status.ilike(status))

    if qtext:
        query = query.join(UserPolicy).join(User).filter(
            or_(Claim.claim_number.ilike(f"%{qtext}%"), User.email.ilike(f"%{qtext}%"))
        )

    if severity:
        subq = db.session.query(FraudFlag.claim_id).filter(FraudFlag.severity == severity).subquery()
        query = query.filter(Claim.id.in_(subq))

    pagination = query.order_by(Claim.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    output = []
    for c in pagination.items:
        # Get flags specifically for this claim
        flags = FraudFlag.query.filter_by(claim_id=c.id).all()
        
        flag_data = [{
            "id": f.id, 
            "rule": f.rule_code, 
            "severity": f.severity, 
            "reason": f.details,
            "is_ignored": f.is_ignored 
        } for f in flags]

        # ✅ SAFETY CHECK: Handle cases where UserPolicy might be missing (orphaned claim)
        up = c.user_policy
        user = up.user if up else None

        output.append({
            "id": c.id,
            "claim_number": c.claim_number,
            
            # Safe access to user data
            "user_id": user.id if user else None,
            "user": user.name if user else "Unknown User",
            "user_email": user.email if user else "N/A",
            
            "amount": c.claim_amount,
            "status": c.status,
            "incident_date": c.incident_date.strftime('%Y-%m-%d') if c.incident_date else "N/A",
            "fraud_flags": flag_data,
            "documents": [{"id": d.id, "file_name": d.file_name} for d in c.documents],
            
            "policy_purchase": {
                "policy_number": up.policy_number if up else "N/A",
                "title": up.policy.title if (up and up.policy) else "Unknown Policy",
                "remaining_amount": up.remaining_sum_insured if up else 0
            }
        })
    
    return jsonify({
        "items": output,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200


# --- ⚖️ CLAIM DECISION (With Email Integration) ---
@admin_bp.route('/claims/<int:claim_id>/decision', methods=['PUT'])
@require_admin
def decide_claim(claim_id):
    try:
        data = request.get_json()
        action = data.get('action')
        admin_comments = data.get('admin_comments', '')
        
        # Load claim with relationships for email data
        claim = Claim.query.options(joinedload(Claim.user_policy).joinedload(UserPolicy.user)).get(claim_id)
        
        if not claim: return jsonify({"message": "Claim not found"}), 404
        if not claim.user_policy: return jsonify({"message": "Associated Policy not found"}), 400

        user = claim.user_policy.user # Get User for Email

        # SAFE MATH: Ensure values are numbers
        current_remaining = float(claim.user_policy.remaining_sum_insured or 0)
        claim_amt = float(claim.claim_amount or 0)
        approved_amt = float(claim.approved_amount or 0)

        # 1. Handle Reversal (If changing from Approved -> Rejected)
        if claim.status == 'Approved' and action == 'reject':
            # Give money back to the policy balance
            claim.user_policy.remaining_sum_insured = current_remaining + approved_amt
            claim.approved_amount = 0

        # 2. Handle Approval
        if action == 'approve':
            if claim.status != 'Approved':
                claim.status = 'Approved'
                
                # Calculate how much we can actually pay (Cap at remaining balance)
                final_approved_amount = min(claim_amt, current_remaining)
                
                claim.approved_amount = final_approved_amount
                claim.user_policy.remaining_sum_insured = max(0, current_remaining - final_approved_amount)
                
                # ✅ SEND "APPROVED" EMAIL
                if user and user.email:
                    send_notification_email(
                        to_email=user.email,
                        user_name=user.name,
                        type='claim_approved',
                        details={
                            'claim_number': claim.claim_number,
                            'amount': f"{final_approved_amount:,.2f}"
                        }
                    )

                # Notify (Database)
                db.session.add(Notification(
                    user_id=claim.user_policy.user_id, 
                    title="Claim Approved", 
                    message=f"Claim {claim.claim_number} approved for ₹{final_approved_amount}."
                ))

        # 3. Handle Rejection
        elif action == 'reject':
            claim.status = 'Rejected'
            claim.admin_comments = admin_comments
            
            # ✅ SEND "REJECTED" EMAIL
            if user and user.email:
                send_notification_email(
                    to_email=user.email,
                    user_name=user.name,
                    type='claim_rejected',
                    details={
                        'claim_number': claim.claim_number,
                        'reason': admin_comments
                    }
                )
            
            # Notify (Database)
            db.session.add(Notification(
                user_id=claim.user_policy.user_id, 
                title="Claim Rejected", 
                message=f"Claim {claim.claim_number} rejected. Reason: {admin_comments}"
            ))
        
        else:
            return jsonify({"message": "Invalid action"}), 400

        # Log and Save
        log = AdminLog(
            admin_id=get_jwt_identity(),
            action=f"Claim {action.upper()}",
            target_type="Claim",
            target_id=claim.id
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({"message": "Decision saved & Email Sent", "status": claim.status}), 200

    except Exception as e:
        db.session.rollback()
        print(f"ERROR in decide_claim: {str(e)}") 
        return jsonify({"message": f"Server Error: {str(e)}"}), 500


# --- 🚀 RE-ANALYZE CLAIM ---
@admin_bp.route('/claims/<int:claim_id>/reanalyze', methods=['POST'])
@require_admin
def reanalyze_claim(claim_id):
    try:
        claim = Claim.query.get(claim_id)
        if not claim: return jsonify({"message": "Not found"}), 404
        
        flag_count = run_fraud_checks(claim)
        new_flags = FraudFlag.query.filter_by(claim_id=claim.id).all()
        
        flag_data = [{
            "id": f.id,
            "rule": f.rule_code, 
            "severity": f.severity, 
            "reason": f.details,
            "is_ignored": f.is_ignored
        } for f in new_flags]
        
        return jsonify({
            "message": "Analysis complete", 
            "flags_found": flag_count,
            "new_flags": flag_data, 
            "new_status": claim.status
        }), 200
    except Exception as e:
        return jsonify({"message": "Analysis failed"}), 500


# --- 🚩 TOGGLE FLAG ---
@admin_bp.route('/flags/<int:flag_id>/toggle', methods=['PUT'])
@require_admin
def toggle_flag_status(flag_id):
    try:
        flag = FraudFlag.query.get(flag_id)
        if not flag: return jsonify({"message": "Flag not found"}), 404
        
        flag.is_ignored = not flag.is_ignored
        db.session.commit()
        
        return jsonify({
            "message": "Flag updated", 
            "is_ignored": flag.is_ignored,
            "claim_id": flag.claim_id
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# --- 👥 USER MANAGEMENT ---
@admin_bp.route('/users', methods=['GET'])
@require_admin
def list_users():
    users = User.query.filter(User.is_admin == False).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        has_fraud = False
        try:
            # Check for active fraud flags
            active_flags = FraudFlag.query.join(Claim).join(UserPolicy).filter(
                UserPolicy.user_id == u.id, 
                FraudFlag.is_ignored == False
            ).count()
            if active_flags > 0: has_fraud = True
        except: pass

        out.append({
            'id': u.id, 'name': u.name, 'email': u.email,
            'is_banned': u.is_banned, 'has_fraud': has_fraud,
            'created_at': u.created_at.isoformat()
        })
    return jsonify(out), 200


# --- 👤 360 DEGREE USER VIEW ---
@admin_bp.route('/users/<int:user_id>/full-profile', methods=['GET'])
@require_admin
def get_user_full_profile(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({"message": "User not found"}), 404

    risk_score = 10 
    
    # Safety Check: Ensure profile is valid dictionary
    profile_data = user.risk_profile if isinstance(user.risk_profile, dict) else {}
    
    try:
        age = int(profile_data.get('age', 30))
    except (ValueError, TypeError):
        age = 30

    try:
        income = int(profile_data.get('income', 50000))
    except (ValueError, TypeError):
        income = 50000
    
    if age > 50: risk_score += 20
    if income < 20000: risk_score += 20

    total_claims = Claim.query.join(UserPolicy).filter(UserPolicy.user_id == user.id).count()
    rejected_claims = Claim.query.join(UserPolicy).filter(UserPolicy.user_id == user.id, Claim.status == 'Rejected').count()
    active_policies = UserPolicy.query.filter_by(user_id=user.id, status='active').count()

    return jsonify({
        "personal": {
            "name": user.name,
            "email": user.email,
            "joined_at": user.created_at.strftime('%Y-%m-%d')
        },
        "risk": {
            "score": risk_score,
            "profile": user.risk_profile
        },
        "stats": {
            "total_claims": total_claims,
            "rejected_claims": rejected_claims,
            "active_policies": active_policies
        }
    }), 200


@admin_bp.route('/users/<int:user_id>/ban', methods=['PUT'])
@require_admin
def ban_user(user_id):
    u = User.query.get(user_id)
    if not u: return jsonify({"message": "User not found"}), 404
    if u.is_admin: return jsonify({"message": "Cannot ban admin"}), 403
    
    u.is_banned = True
    
    log = AdminLog(admin_id=get_jwt_identity(), action="BAN USER", target_type="User", target_id=u.id)
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"message": "User banned"}), 200


@admin_bp.route('/users/<int:user_id>/unban', methods=['PUT'])
@require_admin
def unban_user(user_id):
    u = User.query.get(user_id)
    if not u: return jsonify({"message": "User not found"}), 404
    
    u.is_banned = False
    
    log = AdminLog(admin_id=get_jwt_identity(), action="UNBAN USER", target_type="User", target_id=u.id)
    db.session.add(log)

    db.session.commit()
    return jsonify({"message": "User unbanned"}), 200


# --- 📜 POLICY MANAGEMENT ---
@admin_bp.route('/policies', methods=['POST'])
@require_admin
def create_policy_endpoint():
    data = request.get_json()
    try:
        new_policy = Policy(
            provider_id=data.get('provider_id'), 
            policy_type=data['policy_type'],
            title=data['title'],
            premium=float(data['premium']),
            term_months=int(data.get('term_months', 12)),
            coverage=data.get('coverage', {}), 
            deductible=float(data.get('deductible', 0)),
            waiting_period_days=int(data.get('waiting_period', 0))
        )
        db.session.add(new_policy)
        db.session.commit()
        return jsonify({"message": "Policy created", "id": new_policy.id}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@admin_bp.route('/policies/<int:policy_id>', methods=['DELETE'])
@require_admin
def delete_policy_endpoint(policy_id):
    try:
        policy = Policy.query.get(policy_id)
        if not policy: return jsonify({"message": "Policy not found"}), 404

        active_count = UserPolicy.query.filter_by(policy_id=policy.id).count()
        if active_count > 0:
            return jsonify({"message": "Cannot delete: Active users exist."}), 400

        db.session.delete(policy)
        db.session.commit()
        return jsonify({"message": "Policy deleted"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500