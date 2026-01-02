from app.extensions import db
from .models import Policy, UserPolicy
from app.modules.auth.models import User, Notification
from app.modules.claims.models import Claim 
from datetime import datetime, timedelta
import random

class PolicyService:
    @staticmethod
    def get_catalog():
        """Returns all available policies"""
        return Policy.query.all()

    @staticmethod
    def get_user_policies(user_id):
        """Returns all policies purchased by the user"""
        return UserPolicy.query.filter_by(user_id=user_id).order_by(UserPolicy.start_date.desc()).all()

    @staticmethod
    def buy_policy(user_id, data):
        policy_id = data.get('policy_id')
        coverage_amount = float(data.get('coverage_amount', 500000))
        
        user = User.query.get(user_id)
        if not user: raise ValueError("User not found")

        # --- 🛡️ CHURN PROTECTION (The "Cooling Off" Rule) ---
        # If user has cancelled > 2 times AND the last cancel was recent (e.g. within 30 days)
        if (user.cancel_count or 0) > 2:
            last_cancel = user.last_cancel_at
            if last_cancel and (datetime.utcnow() - last_cancel).days < 30:
                raise ValueError("Purchase blocked: Too many recent cancellations. Try again in 30 days.")

        policy = Policy.query.get(policy_id)
        if not policy: raise ValueError("Policy not found")

        # Check Duplicate Active Policy
        existing = UserPolicy.query.filter_by(
            user_id=user_id, policy_id=policy.id, status='active'
        ).first()
        if existing:
            raise ValueError("You already have this active policy")

        # Calculate Dates
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=policy.term_months * 30)
        
        # Create Policy
        policy_number = f"POL-{random.randint(10000, 99999)}"
        new_up = UserPolicy(
            user_id=user_id,
            policy_id=policy.id,
            policy_number=policy_number,
            start_date=start_date,
            end_date=end_date,
            premium_amount=policy.premium,
            coverage_amount=coverage_amount,
            remaining_sum_insured=coverage_amount,
            status='active'
        )

        # Notify
        notif = Notification(
            user_id=user_id,
            title="Policy Purchased",
            message=f"You have successfully purchased {policy.title}."
        )

        db.session.add(new_up)
        db.session.add(notif)
        db.session.commit()
        return new_up

    @staticmethod
    def cancel_policy(user_id, user_policy_id):
        user_policy = UserPolicy.query.filter_by(id=user_policy_id, user_id=user_id).first()
        if not user_policy:
            raise ValueError("Policy not found")
        
        if user_policy.status == 'cancelled':
            raise ValueError("Policy is already cancelled")

        # 1. Revoke Pending Claims
        pending_claims = Claim.query.filter(
            Claim.user_policy_id == user_policy.id,
            Claim.status.in_(['Submitted', 'In Review', 'under_review'])
        ).all()

        revoked_count = 0
        for claim in pending_claims:
            claim.status = 'Rejected'
            claim.admin_comments = "Auto-rejected: Policy cancelled by user."
            revoked_count += 1

        # 2. Update Policy Status
        user_policy.status = 'cancelled'

        # 3. Update User Churn Stats (Increment Count)
        user = User.query.get(user_id)
        if user:
            user.cancel_count = (user.cancel_count or 0) + 1
            user.last_cancel_at = datetime.utcnow()

        # 4. Notify
        msg = f"Your policy {user_policy.policy.title} has been cancelled."
        if revoked_count > 0:
            msg += f" WARNING: {revoked_count} pending claim(s) were automatically revoked."

        db.session.add(Notification(user_id=user_id, title="Policy Cancelled", message=msg))
        db.session.commit()
        
        return revoked_count

    @staticmethod
    def pay_premium(user_id, user_policy_id):
        user_policy = UserPolicy.query.filter_by(id=user_policy_id, user_id=user_id).first()
        if not user_policy: raise ValueError("Policy not found")
        
        # Mock Logic: Just extend date or log payment
        db.session.add(Notification(user_id=user_id, title="Premium Paid", message=f"Payment received for {user_policy.policy_number}."))
        db.session.commit()
        return True