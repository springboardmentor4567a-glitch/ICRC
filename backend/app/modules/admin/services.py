from app.extensions import db
from app.modules.auth.models import User, Notification
from app.modules.policies.models import Policy, UserPolicy
from app.modules.claims.models import Claim, FraudFlag, ClaimDocument
from app.modules.fraud.engine import run_fraud_checks
from sqlalchemy import or_

class AdminService:
    @staticmethod
    def get_dashboard_stats():
        return {
            "users": User.query.filter(User.is_admin == False).count(),
            "policies": Policy.query.count(),
            "pending_claims": Claim.query.filter(Claim.status.in_(['Submitted', 'under_review', 'In Review'])).count(),
            "fraud_flags": FraudFlag.query.count()
        }

    @staticmethod
    def get_claims(page=1, per_page=50, status=None, search=None, severity=None):
        query = Claim.query
        
        if status: query = query.filter(Claim.status.ilike(status))
        if search:
            query = query.join(UserPolicy).join(User).filter(
                or_(Claim.claim_number.ilike(f"%{search}%"), User.email.ilike(f"%{search}%"))
            )
        if severity:
            subq = db.session.query(FraudFlag.claim_id).filter(FraudFlag.severity == severity).subquery()
            query = query.filter(Claim.id.in_(subq))

        pagination = query.order_by(Claim.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        output = []
        for c in pagination.items:
            output.append({
                "id": c.id,
                "claim_number": c.claim_number,
                "user": c.user_policy.user.name,
                "user_email": c.user_policy.user.email,
                "amount": c.claim_amount,
                "status": c.status,
                "incident_date": c.incident_date.strftime('%Y-%m-%d'),
                "incident_description": c.incident_description,
                "fraud_flags": [{"id": f.id, "rule": f.rule_code, "severity": f.severity, "reason": f.details, "is_ignored": f.is_ignored} for f in c.fraud_flags],
                "documents": [{"id": d.id, "file_name": d.file_name} for d in c.documents],
                "policy_purchase": {
                    "policy_number": c.user_policy.policy_number,
                    "title": c.user_policy.policy.title,
                    "remaining_amount": c.user_policy.remaining_sum_insured
                }
            })
        return {"items": output, "total": pagination.total, "pages": pagination.pages}

    @staticmethod
    def decide_claim(claim_id, action, comments=""):
        claim = Claim.query.get(claim_id)
        if not claim: raise ValueError("Claim not found")

        if action == 'approve':
            claim.status = 'Approved'
            up = claim.user_policy
            approved = min(claim.claim_amount, up.remaining_sum_insured)
            claim.approved_amount = approved
            up.remaining_sum_insured = max(0, up.remaining_sum_insured - approved)
            
            db.session.add(Notification(user_id=up.user_id, title="Claim Approved", message=f"Claim {claim.claim_number} approved for ₹{approved}."))

        elif action == 'reject':
            claim.status = 'Rejected'
            claim.admin_comments = comments
            db.session.add(Notification(user_id=claim.user_policy.user_id, title="Claim Rejected", message=f"Claim {claim.claim_number} rejected: {comments}"))
        
        db.session.commit()
        return claim.status

    @staticmethod
    def reanalyze_claim(claim_id):
        claim = Claim.query.get(claim_id)
        if not claim: raise ValueError("Claim not found")
        count = run_fraud_checks(claim)
        
        # Refresh from DB
        new_flags = FraudFlag.query.filter_by(claim_id=claim.id).all()
        return {
            "flags_found": count,
            "new_flags": [{"id": f.id, "rule": f.rule_code, "severity": f.severity, "reason": f.details, "is_ignored": f.is_ignored} for f in new_flags],
            "new_status": claim.status
        }

    @staticmethod
    def toggle_flag(flag_id):
        flag = FraudFlag.query.get(flag_id)
        if not flag: raise ValueError("Flag not found")
        flag.is_ignored = not flag.is_ignored
        db.session.commit()
        return flag.is_ignored

    @staticmethod
    def create_policy(data):
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
        return new_policy

    @staticmethod
    def delete_policy(policy_id):
        policy = Policy.query.get(policy_id)
        if not policy: raise ValueError("Policy not found")
        
        active = UserPolicy.query.filter_by(policy_id=policy.id).count()
        if active > 0: raise ValueError(f"Cannot delete. Owned by {active} users.")
        
        db.session.delete(policy)
        db.session.commit()

    @staticmethod
    def get_users_list():
        users = User.query.filter(User.is_admin == False).order_by(User.created_at.desc()).all()
        out = []
        for u in users:
            # Check for active fraud
            has_fraud = FraudFlag.query.join(Claim).join(UserPolicy).filter(
                UserPolicy.user_id == u.id, 
                FraudFlag.is_ignored == False
            ).count() > 0
            
            out.append({
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'is_banned': u.is_banned,
                'has_fraud': has_fraud,
                'created_at': u.created_at.isoformat()
            })
        return out

    @staticmethod
    def ban_user(user_id, unban=False):
        u = User.query.get(user_id)
        if not u: raise ValueError("User not found")
        if u.is_admin: raise ValueError("Cannot ban admin")
        
        u.is_banned = not unban
        db.session.commit()