import models
from sqlalchemy.orm import Session
from datetime import datetime

def run_fraud_check(db: Session, claim_id: int):
    """
    Analyzes a specific claim against 3 key risk rules.
    If risk is found, creates a FraudFlag entry.
    """
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        return

    # Fetch related policy purchase info
    purchase = db.query(models.UserPolicy).filter(models.UserPolicy.id == claim.purchase_id).first()
    if not purchase:
        return
    
    policy = db.query(models.Policy).filter(models.Policy.id == purchase.policy_id).first()
    if not policy:
        return
    
    flags = []

    days_since_purchase = (claim.created_at - purchase.purchase_date).days
    if days_since_purchase < 15:
        flags.append({
            "code": "F01_QUICK_CLAIM",
            "severity": "High",
            "details": f"Claim filed just {days_since_purchase} days after purchase."
        })

    if claim.claim_amount > (policy.cover_amount * 0.8):
        flags.append({
            "code": "F02_HIGH_VALUE",
            "severity": "Medium",
            "details": f"Claim amount ({claim.claim_amount}) is >80% of cover ({policy.cover_amount})."
        })

    past_claims = db.query(models.Claim).filter(models.Claim.user_id == claim.user_id).count()
    if past_claims > 2:
        flags.append({
            "code": "F03_FREQ_CLAIMANT",
            "severity": "Low",
            "details": f"User has filed {past_claims} claims previously."
        })

    for flag in flags:
        new_flag = models.FraudFlag(
            claim_id=claim.id,
            rule_code=flag["code"],
            severity=flag["severity"],
            details=flag["details"]
        )
        db.add(new_flag)
    
    db.commit()

