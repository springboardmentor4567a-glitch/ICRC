from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, Policy

recommendations_bp = Blueprint('recommendations', __name__)

# 🔴 WAS: @recommendations_bp.route('/generate', methods=['GET'])
# 🟢 CHANGE TO:
@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.risk_profile:
        # Return empty list or redirect instruction if no profile
        return jsonify({"message": "Profile missing", "redirect": "/risk-profile"}), 200

    # 1. User Data
    profile = user.risk_profile
    requested_types = profile.get('policy_types', [])
    if not isinstance(requested_types, list): requested_types = []
    
    age = int(profile.get('age', 0))
    income = int(profile.get('income', 0))
    dependents = int(profile.get('dependents', 0))
    health_status = profile.get('health', 'good').lower()
    owns_vehicle = profile.get('vehicle_ownership', False)
    # Handle string 'true'/'false' from JSON
    if isinstance(owns_vehicle, str): owns_vehicle = owns_vehicle.lower() == 'true'

    all_policies = Policy.query.all()
    recommendations = []
    found_types = set()

    for policy in all_policies:
        if policy.policy_type not in requested_types:
            continue

        score = 0
        reasons = []
        tags = []

        # --- 1. METRICS ---
        csr = 80 + (policy.id * 7 % 20) 
        popularity = 1000 + (policy.id * 123 % 9000)

        # --- 2. REALISTIC COVERAGE CALCULATION ---
        coverage_val = 0
        
        # Try DB first
        if policy.coverage:
            if isinstance(policy.coverage, dict):
                val = policy.coverage.get('max', policy.coverage.get('default', 0))
                coverage_val = int(val)
            else:
                try: coverage_val = int(policy.coverage)
                except: coverage_val = 0
        
        # Fix missing coverage data
        if coverage_val == 0:
            if policy.policy_type == 'health':
                base_cov = policy.premium * 2000
                coverage_val = max(base_cov, 500000) 
            elif policy.policy_type == 'life':
                base_cov = policy.premium * 10000
                coverage_val = max(base_cov, 2500000)
            elif policy.policy_type == 'auto':
                base_cov = policy.premium * 1000
                coverage_val = max(base_cov, 300000)
            
            coverage_val = round(coverage_val / 100000) * 100000

        # Format display text
        if coverage_val >= 10000000:
            val_cr = round(coverage_val/10000000, 2)
            coverage_display = f"₹{val_cr} Cr"
        elif coverage_val >= 100000:
            val_lakh = round(coverage_val/100000, 1)
            if val_lakh % 1 == 0: val_lakh = int(val_lakh)
            coverage_display = f"₹{val_lakh} Lakhs"
        else:
            coverage_display = f"₹{coverage_val}"

        # --- 3. SCORING ---
        if policy.policy_type == 'auto':
            if owns_vehicle:
                score += 80
                reasons.append("Essential coverage for your vehicle")
            elif income > 800000:
                score += 40
                reasons.append("High-income recommendation")
            if "Zero Dep" in policy.title:
                score += 10
                tags.append("Zero Dep")

        elif policy.policy_type == 'health':
            score += 50
            if health_status in ['poor', 'average']:
                if policy.premium > 500: score += 30
            else:
                if policy.premium < 500: score += 20
            
            if csr > 90:
                score += 10
                reasons.append(f"High Trust Score ({csr}%)")

        elif policy.policy_type == 'life':
            if dependents > 0: score += 70
            elif age > 50: score += 40
            else: score += 10

        # Income Logic
        if income > 1000000 and policy.premium > 600: score += 10
        elif income < 500000 and policy.premium < 350: score += 20

        # --- 4. TAGS ---
        if popularity > 6000 and score > 60: tags.append("Best Seller")
        if csr >= 95: tags.append(f"High CSR {csr}%")
        if policy.premium < 300: tags.append("Economy")
        elif policy.premium > 800: tags.append("Premium")

        if score > 0:
            if len(reasons) == 0: reasons.append("Standard coverage meeting your criteria")
            
            recommendations.append({
                "id": policy.id,
                "title": policy.title,
                "provider": policy.provider.name if policy.provider else "Unknown",
                "premium": policy.premium,
                "policy_type": policy.policy_type,
                "match_score": score,
                "match_reasons": reasons,
                "csr": csr,         
                "tags": tags,
                "coverage_display": coverage_display,
                "coverage_val": coverage_val
            })
            found_types.add(policy.policy_type)

    # --- 5. SORT ---
    recommendations.sort(key=lambda x: (x['match_score'], x['csr'], -x['premium']), reverse=True)

    # No Match Logic
    for req_type in requested_types:
        if req_type not in found_types:
            recommendations.append({
                "id": f"nomatch-{req_type}",
                "title": f"No {req_type.capitalize()} Matches",
                "provider": "System",
                "premium": 0,
                "policy_type": req_type,
                "match_score": 0,
                "match_reasons": ["Profile criteria not met"],
                "csr": 0,
                "tags": [],
                "coverage_display": "N/A",
                "coverage_val": 0
            })

    return jsonify(recommendations), 200