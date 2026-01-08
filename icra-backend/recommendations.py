from sqlalchemy.orm import Session
import models
import datetime

def calculate_score(user: models.User, policy: models.Policy):
    """
    Analyzes user profile and policy details to generate a relevance score (0-100).
    Returns a tuple: (score, reason)
    """
    score = 50
    reasons = []
    
    profile = user.risk_profile or {}
    
    if policy.category == "Health":
        if user.dob:
            age = datetime.date.today().year - user.dob.year
            if age > 40:
                score += 10
                reasons.append("Recommended for your age group")
        
        if profile.get("smoker"):
            score += 15
            reasons.append("Critical coverage for smokers")
            
        conditions = profile.get("health_conditions", [])
        if conditions and "None" not in conditions:
            score += 20
            reasons.append(f"Covers your conditions: {', '.join(conditions)}")

    elif policy.category == "Life":
        dependents = int(profile.get("dependents", 0))
        if dependents > 0:
            score += 30
            reasons.append(f"Protects your {dependents} dependents")
        
        if profile.get("marital_status") == "Married":
            score += 10
            reasons.append("Recommended for married individuals")

    elif policy.category == "Auto":
        user_vehicle = profile.get("vehicle_type", "None")
        
        if user_vehicle == "None":
            return 0, "Not relevant (No vehicle owned)"
            
        score += 40
        reasons.append(f"Matches your {user_vehicle}")

    elif policy.category == "Finance":
        income = int(profile.get("annual_income", 0))
        if income > 1500000:
            score += 20
            reasons.append("Good for tax saving & wealth growth")

    return min(score, 100), "; ".join(reasons)

def generate_recommendations(user_id: int, db: Session):
    """
    Runs the scoring engine for a specific user against ALL policies.
    Saves the results to the Recommendation table.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    policies = db.query(models.Policy).all()
    
    db.query(models.Recommendation).filter(models.Recommendation.user_id == user_id).delete()
    
    new_recs = []
    for policy in policies:
        score, reason = calculate_score(user, policy)
        
        if score >= 40:  
            rec = models.Recommendation(
                user_id=user.id,
                policy_id=policy.id,
                score=score,
                reason=reason
            )
            new_recs.append(rec)
    
    if new_recs:
        db.add_all(new_recs)
        db.commit()
        
    return new_recs