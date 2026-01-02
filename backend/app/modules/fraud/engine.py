from datetime import datetime, timedelta, date
from app.extensions import db
from app.modules.claims.models import FraudFlag, Claim, ClaimDocument
from app.modules.policies.models import UserPolicy
from app.modules.auth.models import User

def run_fraud_checks(claim):
    """
    Runs context-aware fraud rules.
    Distinguishes between GENUINE CATASTROPHIC CLAIMS and FRAUD.
    Returns the number of flags found.
    """
    # 1. Clear existing flags (for re-analysis)
    FraudFlag.query.filter_by(claim_id=claim.id).delete()
    
    # 2. Gather Data
    user_policy = claim.user_policy
    user = User.query.get(user_policy.user_id)
    
    # Ensure dates are date objects
    incident_date = claim.incident_date if isinstance(claim.incident_date, date) else claim.incident_date.date()
    policy_start = user_policy.start_date.date() if isinstance(user_policy.start_date, datetime) else user_policy.start_date
    today = datetime.utcnow().date()
    
    # Calculate Tenure
    tenure_days = (today - policy_start).days

    # Check Evidence
    has_evidence = ClaimDocument.query.filter_by(claim_id=claim.id).count() > 0

    flags = []

    # --- 🚨 CRITICAL RULES (High Confidence Fraud) ---

    # Rule 1: GHOST CLAIM (High)
    if not has_evidence:
        flags.append(FraudFlag(claim_id=claim.id, rule_code='MISSING_EVIDENCE', severity='high', details="Claim filed without any documents."))

    # Rule 2: RETROACTIVE (High)
    if incident_date < policy_start:
        flags.append(FraudFlag(claim_id=claim.id, rule_code='RETROACTIVE_CLAIM', severity='high', details=f"Incident ({incident_date}) occurred before policy start."))

    # Rule 3: SAME DAY (High)
    if incident_date == policy_start:
        flags.append(FraudFlag(claim_id=claim.id, rule_code='SAME_DAY_CLAIM', severity='high', details="Policy purchased on the day of the incident."))

    # Rule 4: FUTURE INCIDENT (High)
    if incident_date > today:
        flags.append(FraudFlag(claim_id=claim.id, rule_code='FUTURE_INCIDENT', severity='high', details="Incident date is in the future."))

    # --- 🧠 CONTEXT-AWARE RULES (Intelligent Analysis) ---

    # Rule 5: HIGH VALUE vs TENURE
    limit = user_policy.remaining_sum_insured or 0
    if limit > 0:
        utilization = claim.claim_amount / limit
        
        # Scenario A: Early Claim + High Value (Suspicious)
        if utilization >= 0.95 and tenure_days < 30:
             flags.append(FraudFlag(claim_id=claim.id, rule_code='EARLY_MAX_CLAIM', severity='high', details="Policy drained 100% within 30 days of purchase."))
        
        # Scenario B: Over Limit (Always Bad)
        elif utilization > 1.0:
             flags.append(FraudFlag(claim_id=claim.id, rule_code='OVER_LIMIT', severity='medium', details="Claim exceeds available balance."))

    # Rule 6: CROSS-POLICY SPIKE
    recent_cross_claims = Claim.query.join(UserPolicy).filter(
        UserPolicy.user_id == user.id,
        Claim.id != claim.id,
        Claim.incident_date >= (incident_date - timedelta(days=5)),
        Claim.incident_date <= (incident_date + timedelta(days=5))
    ).count()

    if recent_cross_claims > 0:
        flags.append(FraudFlag(claim_id=claim.id, rule_code='MULTI_POLICY_EVENT', severity='low', details=f"User has {recent_cross_claims} other claims this week. Context: Possible major accident."))

    # Rule 7: ROUND NUMBERS (Refined)
    if claim.claim_amount > 25000 and claim.claim_amount % 10000 == 0 and tenure_days < 90:
        flags.append(FraudFlag(claim_id=claim.id, rule_code='ROUND_NUMBER_BIAS', severity='medium', details="Perfectly round large amount on new policy."))

    # Rule 8: FREQUENCY (Velocity)
    last_30 = datetime.utcnow() - timedelta(days=30)
    recent_count = Claim.query.join(UserPolicy).filter(
        UserPolicy.user_id == user.id, 
        Claim.created_at >= last_30
    ).count()
    
    if recent_count > 2: # >2 because current claim is counted
        flags.append(FraudFlag(claim_id=claim.id, rule_code='FREQUENCY_SPIKE', severity='medium', details=f"High velocity: {recent_count} claims in 30 days."))

    # Rule 9: TEXT ANALYSIS
    suspicious_words = ['test', 'dummy', 'fake', 'sample']
    if any(w in (claim.incident_description or "").lower() for w in suspicious_words):
        flags.append(FraudFlag(claim_id=claim.id, rule_code='TEST_DATA_DETECTED', severity='medium', details="Description contains test keywords."))

    # --- SAVE ---
    for f in flags:
        db.session.add(f)
    
    # Auto-Flag Status if High Risk
    if any(f.severity == 'high' for f in flags) and claim.status == 'Submitted':
        claim.status = 'under_review'

    db.session.commit()
    return len(flags)