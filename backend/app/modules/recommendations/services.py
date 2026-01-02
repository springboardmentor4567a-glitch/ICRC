from app.modules.auth.models import User
from app.modules.policies.models import Policy

class RecommendationService:
    @staticmethod
    def generate_recommendations(user_id):
        user = User.query.get(user_id)
        if not user or not user.risk_profile:
            return {"redirect": "/risk-profile"}

        # 1. Parse Profile Data
        profile = user.risk_profile
        requested_types = profile.get('policy_types', [])
        if not isinstance(requested_types, list): requested_types = []
        
        income = int(profile.get('income', 0))
        dependents = int(profile.get('dependents', 0))
        health_status = profile.get('health', 'good').lower()
        owns_vehicle = str(profile.get('vehicle_ownership', 'false')).lower() == 'true'

        all_policies = Policy.query.all()
        recommendations = []
        found_types = set()

        for policy in all_policies:
            if policy.policy_type not in requested_types:
                continue

            score = 0
            reasons = []
            tags = []

            # --- METRICS & SCORING ---
            csr = 80 + (policy.id * 7 % 20) 
            popularity = 1000 + (policy.id * 123 % 9000)

            # Type Specific Scoring
            if policy.policy_type == 'auto':
                if owns_vehicle:
                    score += 80
                    reasons.append("Essential for your vehicle")
                elif income > 800000:
                    score += 40
                if "Zero Dep" in policy.title:
                    score += 10
                    tags.append("Zero Dep")

            elif policy.policy_type == 'health':
                score += 50
                if health_status in ['poor', 'average'] and policy.premium > 500:
                    score += 30
                elif health_status == 'good' and policy.premium < 500:
                    score += 20
                
                if csr > 90:
                    score += 10
                    reasons.append(f"High Trust Score ({csr}%)")

            elif policy.policy_type == 'life':
                if dependents > 0: score += 70
                elif int(profile.get('age', 0)) > 50: score += 40
                else: score += 10

            # Income Logic
            if income > 1000000 and policy.premium > 600: score += 10
            elif income < 500000 and policy.premium < 350: score += 20

            # Tags
            if popularity > 6000 and score > 60: tags.append("Best Seller")
            if csr >= 95: tags.append(f"High CSR {csr}%")
            if policy.premium < 300: tags.append("Economy")

            if score > 0:
                if not reasons: reasons.append("Matches your profile criteria")
                
                # Coverage Formatting
                cov_val = 0
                if policy.coverage:
                    val = policy.coverage.get('max', 0) if isinstance(policy.coverage, dict) else policy.coverage
                    try: cov_val = int(val)
                    except: cov_val = 0
                
                # Fallback coverage if missing
                if cov_val == 0:
                    multipliers = {'health': 2000, 'life': 10000, 'auto': 1000}
                    cov_val = policy.premium * multipliers.get(policy.policy_type, 1000)

                # Format Text
                if cov_val >= 10000000: cov_display = f"₹{round(cov_val/10000000, 2)} Cr"
                elif cov_val >= 100000: cov_display = f"₹{round(cov_val/100000, 1)} Lakhs"
                else: cov_display = f"₹{cov_val}"

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
                    "coverage_display": cov_display,
                    "coverage_val": cov_val
                })
                found_types.add(policy.policy_type)

        # Sort by Score
        recommendations.sort(key=lambda x: (x['match_score'], x['csr']), reverse=True)

        # Handle No Match
        for req_type in requested_types:
            if req_type not in found_types:
                recommendations.append({
                    "id": f"nomatch-{req_type}",
                    "title": f"No {req_type.capitalize()} Matches",
                    "provider": "System",
                    "premium": 0,
                    "policy_type": req_type,
                    "match_score": 0,
                    "match_reasons": ["Criteria not met"],
                    "csr": 0, "tags": [], "coverage_display": "N/A", "coverage_val": 0
                })

        return recommendations