from fastapi import APIRouter, HTTPException, Depends
from backend.models import db, Claim, User, UserPolicy, Policy
from backend.routers.auth import get_current_user, admin_required

router = APIRouter()

@router.get("/api/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(admin_required)):
    try:
        # Query all claims from database
        claims = Claim.query.all()
        total_claims = len(claims)
        pending_claims = len([c for c in claims if c.status == 'pending'])
        approved_claims = len([c for c in claims if c.status == 'approved'])
        rejected_claims = len([c for c in claims if c.status == 'rejected'])
        total_claim_amount = sum(c.amount_claimed for c in claims)

        # Calculate claims by type
        claims_by_type = {}
        for claim in claims:
            claim_type = claim.claim_type
            claims_by_type[claim_type] = claims_by_type.get(claim_type, 0) + 1

        # Calculate fraud flags (claims with fraud_score > 0.7)
        fraud_flags = len([c for c in claims if c.fraud_score > 0.7])

        # Get recent activity from claims (last 3 updated)
        recent_activity = []
        sorted_claims = sorted(claims, key=lambda x: x.created_at, reverse=True)
        for claim in sorted_claims[:3]:
            action = f"Claim {claim.status}"
            recent_activity.append({
                "action": action,
                "timestamp": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                "user": f"User {claim.user_policy.user.id}"
            })

        # Query users and policies for dynamic counts
        total_users = User.query.count()
        active_policies = UserPolicy.query.filter_by(status='active').count()

        # Query policies by category
        policies_by_category = {}
        policies = Policy.query.all()
        for policy in policies:
            category = policy.category
            policies_by_category[category] = policies_by_category.get(category, 0) + 1

        analytics = {
            "total_users": total_users,
            "active_policies": active_policies,
            "total_claims": total_claims,
            "pending_claims": pending_claims,
            "approved_claims": approved_claims,
            "rejected_claims": rejected_claims,
            "total_premiums": total_claim_amount,
            "monthly_revenue": total_claim_amount // 12 if total_claim_amount > 0 else 0,
            "claims_by_type": claims_by_type,
            "policies_by_category": policies_by_category,
            "fraud_flags": fraud_flags,
            "recent_activity": recent_activity
        }
        return analytics
    except Exception as e:
        print(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")
