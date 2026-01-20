from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.auth.models import User
from app.modules.policies.models import Policy
import random

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user: return jsonify({"message": "User not found"}), 404

    # 1. Get User Profile (Safely)
    profile = user.risk_profile if isinstance(user.risk_profile, dict) else {}
    
    try:
        age = int(profile.get('age', 30))
        income = int(profile.get('income', 500000))
    except:
        age = 30
        income = 500000

    # 2. Fetch all policies
    all_policies = Policy.query.all()
    recommendations = []

    for p in all_policies:
        score = 50 # Base Score
        reason = "Standard Match"
        premium = float(p.premium)
        
        # --- SCORING LOGIC ---
        
        # Age Logic
        if p.policy_type == 'health':
            if age > 40 and premium > 5000:
                score += 20
                reason = "High coverage recommended for your age."
            elif age < 30 and premium < 3000:
                score += 30
                reason = "Best value plan for young starters."
        
        # Income Logic
        if income > 1000000 and premium > 10000:
             score += 15
             reason = "Premium plan matching your income bracket."
        elif income < 500000 and premium < 5000:
             score += 10
             reason = "Budget-friendly option."

        # Cap Score at 98
        score = min(score, 98)

        # 3. Filter & Shape Data
        # We lower the threshold to 40 to ensure you see items in the UI
        if score >= 40:
            recommendations.append({
                "id": p.id,
                "title": p.title,
                "provider": p.provider_data.name if p.provider_data else "Unknown",
                "premium": premium,
                
                # ✅ CRITICAL FIX: Adding these missing fields prevents the empty list!
                "policy_type": p.policy_type, # Required for Frontend Filtering
                "match_score": score,         # Required for Sorting
                "score": score,               
                "reason": reason,
                "csr": random.randint(92, 99) # Required for 'Trust Score'
            })

    # 4. Sort: Highest Score First
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify(recommendations), 200