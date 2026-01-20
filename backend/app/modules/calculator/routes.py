from flask import Blueprint, request, jsonify
from app.modules.policies.models import Policy

calculator_bp = Blueprint('calculator', __name__)

@calculator_bp.route('/calculate', methods=['POST'])
def calculate_premium():
    """
    Calculates premium based on Age, Coverage, and Policy Type.
    Logic synchronized with Frontend PremiumCalculator.jsx
    """
    data = request.get_json()
    policy_id = data.get('policy_id')
    
    # Inputs with Safe Defaults
    try:
        age = int(data.get('age', 30))
        coverage = float(data.get('coverage_amount', 500000))
        policy_type = data.get('policy_type', 'life').lower()
    except:
        return jsonify({"message": "Invalid input data"}), 400
    
    base_rate = 0.0
    plan_title = "Market Standard Plan"

    # 1. Determine Base Rate (Per 1000 sum insured)
    if policy_id:
        policy = Policy.query.get(policy_id)
        if policy:
            plan_title = policy.title
            # Reverse engineer base rate from premium assuming standard 5L coverage
            # Or use policy.premium if it's stored as a base rate
            # Here we follow frontend logic: (Premium / 500000) * 1000
            base_rate = (float(policy.premium) / 500000.0) * 1000.0
    
    # Fallback if no policy found or selected (General Market Average)
    if base_rate == 0:
        if policy_type == 'life': base_rate = 5.5
        elif policy_type == 'health': base_rate = 8.0
        elif policy_type == 'auto': base_rate = 18.0
        else: base_rate = 5.0

    # 2. Age Factor (Linear Scaling: +2.5% per year over 18)
    # Matches Frontend: 1 + ((age - 18) * 0.025)
    age_factor = 1.0 + ((max(18, age) - 18) * 0.025)

    # 3. Final Calculation
    # Formula: (Coverage / 1000) * BaseRate * AgeFactor
    estimated_annual = (coverage / 1000.0) * base_rate * age_factor

    return jsonify({
        "plan_title": plan_title,
        "base_rate_applied": base_rate,
        "age_factor": round(age_factor, 2),
        "annual_premium": round(estimated_annual),
        "monthly_premium": round(estimated_annual / 12)
    }), 200