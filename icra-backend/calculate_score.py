def calculate_score(user: models.User, policy: models.Policy):
    score = 50 
    reasons = []
    profile = user.risk_profile or {}

    # --- 1. HEALTH LOGIC ---
    if policy.category == "Health":
        # Check BMI (Weight / Height^2)
        try:
            h = float(profile.get("height", 0)) / 100
            w = float(profile.get("weight", 0))
            if h > 0 and w > 0:
                bmi = w / (h * h)
                if bmi > 25:
                    score += 15
                    reasons.append("High BMI detected (Recommended for extra cover)")
        except:
            pass

        # Lifestyle
        if profile.get("smoker") or profile.get("alcohol") == "Regular":
            score += 20
            reasons.append("Lifestyle risks detected")

        # Specific Conditions
        conditions = profile.get("medical_history", [])
        if conditions and "None" not in conditions:
            score += 30
            reasons.append(f"Covers history: {', '.join(conditions)}")

    # --- 2. LIFE & FINANCE LOGIC ---
    elif policy.category == "Life":
        loans = float(profile.get("existing_loans", 0))
        deps = int(profile.get("dependents", 0))
        
        # High Debt = High need for Term Insurance
        if loans > 500000: 
            score += 25
            reasons.append("Essential to cover your existing loans")
        
        if deps > 0:
            score += 20
            reasons.append(f"Security for {deps} dependents")

        if profile.get("occupation") == "Hazardous":
            score += 15
            reasons.append("Includes Accidental Rider (Recommended for your job)")

    # --- 3. AUTO LOGIC ---
    elif policy.category == "Auto":
        user_car = profile.get("vehicle_type", "None")
        car_age = int(profile.get("vehicle_age", 0))
        
        if user_car == "None":
            return 0, "No vehicle owned"
            
        score += 40
        if car_age < 3:
            reasons.append("Zero-Depreciation recommended for new car")
            score += 10
        else:
            reasons.append("Standard Comprehensive Plan")

    # --- 4. GENERAL PRIORITY BOOST ---
    # If policy matches their top goal (cheapest or best cover)
    priority = profile.get("top_priority")
    if priority == "Low Premium" and policy.premium < 10000:
        score += 15
        reasons.append("Matches your goal: Low Premium")
    elif priority == "Max Cover" and policy.cover_amount > 5000000:
        score += 15
        reasons.append("Matches your goal: Maximum Coverage")

    return min(score, 100), "; ".join(reasons)