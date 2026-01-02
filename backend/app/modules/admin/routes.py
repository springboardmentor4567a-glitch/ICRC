from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from sqlalchemy import or_
import os

# ✅ FIXED IMPORTS: Absolute paths (Required for Modular Structure)
from app.extensions import db
from app.modules.auth.models import User, Notification
from app.modules.policies.models import Policy, UserPolicy
from app.modules.claims.models import Claim, FraudFlag, ClaimDocument
from app.modules.fraud.engine import run_fraud_checks 

admin_bp = Blueprint('admin', __name__)

# --- 🛡️ ADMIN AUTH DECORATOR ---
def require_admin(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
        except Exception as e:
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


# --- 🔍 CLAIMS MANAGEMENT ---
@admin_bp.route('/claims', methods=['GET'])
@require_admin
def list_claims():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    status = request.args.get('status')
    qtext = request.args.get('q', '').strip()
    severity = request.args.get('severity', '').strip().lower()
    
    query = Claim.query

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
        flags = FraudFlag.query.filter_by(claim_id=c.id).all()
        # Ensure we send 'is_ignored'
        flag_data = [{
            "id": f.id, 
            "rule": f.rule_code, 
            "severity": f.severity, 
            "reason": f.details,
            "is_ignored": f.is_ignored 
        } for f in flags]

        output.append({
            "id": c.id,
            "claim_number": c.claim_number,
            "user": c.user_policy.user.name,
            "user_email": c.user_policy.user.email,
            "amount": c.claim_amount,
            "status": c.status,
            "incident_date": c.incident_date.strftime('%Y-%m-%d'),
            "fraud_flags": flag_data,
            # Pass document info so frontend doesn't crash
            "documents": [{"id": d.id, "file_name": d.file_name} for d in c.documents],
            "policy_purchase": {
                "policy_number": c.user_policy.policy_number,
                "title": c.user_policy.policy.title if c.user_policy.policy else "Unknown",
                "remaining_amount": c.user_policy.remaining_sum_insured
            }
        })
    
    return jsonify({
        "items": output,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200


# --- ⚖️ CLAIM DECISION (Fixed Reversal Logic) ---
@admin_bp.route('/claims/<int:claim_id>/decision', methods=['PUT'])
@require_admin
def decide_claim(claim_id):
    try:
        data = request.get_json()
        action = data.get('action')
        admin_comments = data.get('admin_comments', '')
        claim = Claim.query.get(claim_id)
        
        if not claim: return jsonify({"message": "Claim not found"}), 404

        # ✅ HANDLE REVERSAL: If previously Approved, Restore the Sum Insured
        if claim.status == 'Approved' and action == 'reject':
            if claim.approved_amount and claim.approved_amount > 0:
                claim.user_policy.remaining_sum_insured += claim.approved_amount
                claim.approved_amount = 0 # Reset approved amount

        if action == 'approve':
            # Prevent double deduction if already approved
            if claim.status != 'Approved':
                claim.status = 'Approved'
                up = claim.user_policy
                approved_amt = min(claim.claim_amount, up.remaining_sum_insured)
                claim.approved_amount = approved_amt
                up.remaining_sum_insured = max(0, up.remaining_sum_insured - approved_amt)
                
                db.session.add(Notification(user_id=up.user_id, title="Claim Approved", message=f"Claim {claim.claim_number} approved for ₹{approved_amt}."))

        elif action == 'reject':
            claim.status = 'Rejected'
            claim.admin_comments = admin_comments
            db.session.add(Notification(user_id=claim.user_policy.user_id, title="Claim Rejected", message=f"Claim {claim.claim_number} rejected: {admin_comments}"))
            
        else:
            return jsonify({"message": "Invalid action"}), 400

        db.session.commit()
        return jsonify({"message": "Decision saved", "status": claim.status}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


# --- 🚀 RE-ANALYZE CLAIM (Must exist for the button to work) ---
@admin_bp.route('/claims/<int:claim_id>/reanalyze', methods=['POST'])
@require_admin
def reanalyze_claim(claim_id):
    try:
        claim = Claim.query.get(claim_id)
        if not claim: return jsonify({"message": "Not found"}), 404
        
        # Run the engine
        flag_count = run_fraud_checks(claim)
        
        # Fetch newly created flags
        new_flags = FraudFlag.query.filter_by(claim_id=claim.id).all()
        
        # Format for Frontend
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
        print(f"Re-analysis Error: {e}")
        return jsonify({"message": "Analysis failed"}), 500


# --- 🚩 TOGGLE FLAG STATUS ---
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
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


# --- 📜 POLICY MANAGEMENT ---
@admin_bp.route('/policies', methods=['POST'])
@require_admin
def create_policy_endpoint():
    data = request.get_json()
    try:
        new_policy = Policy(
            provider_id=data['provider_id'],
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


# --- 👥 USER MANAGEMENT ---
@admin_bp.route('/users', methods=['GET'])
@require_admin
def list_users():
    users = User.query.filter(User.is_admin == False).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        has_fraud = False
        try:
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

@admin_bp.route('/users/<int:user_id>/ban', methods=['PUT'])
@require_admin
def ban_user(user_id):
    u = User.query.get(user_id)
    if not u: return jsonify({"message": "User not found"}), 404
    if u.is_admin: return jsonify({"message": "Cannot ban admin"}), 403
    
    u.is_banned = True
    db.session.commit()
    return jsonify({"message": "User banned"}), 200

@admin_bp.route('/users/<int:user_id>/unban', methods=['PUT'])
@require_admin
def unban_user(user_id):
    u = User.query.get(user_id)
    if not u: return jsonify({"message": "User not found"}), 404
    u.is_banned = False
    db.session.commit()
    return jsonify({"message": "User unbanned"}), 200

