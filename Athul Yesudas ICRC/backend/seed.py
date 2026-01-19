from app import create_app
from app.extensions import db
from app.models import User, Provider, Policy, UserPolicy, Claim
from datetime import datetime, timedelta
import random
from werkzeug.security import generate_password_hash

app = create_app()

def seed_database():
    with app.app_context():
        print("🗑️  Wiping Database (Dropping all tables)...")
        db.drop_all()
        
        print("🛠️  Creating New Schema...")
        db.create_all()

        # --- 1. PROVIDERS ---
        print("🌱 Seeding Providers...")
        providers = [
            Provider(name="HDFC Ergo", country="India"),
            Provider(name="ICICI Lombard", country="India"),
            Provider(name="Star Health", country="India"),
            Provider(name="LIC India", country="India"),
            Provider(name="Tata AIG", country="India"),
            Provider(name="SBI General", country="India"),
            Provider(name="Bajaj Allianz", country="India"),
            Provider(name="Max Life", country="India"),
        ]
        db.session.add_all(providers)
        db.session.commit()

        # --- 2. POLICIES (20+ Realistic Plans) ---
        print("🌱 Seeding Realistic Policies...")
        
        # Common Feature Sets
        health_gold = {"room_rent": "Single Private", "waiting_period": "2 Years", "network_hospitals": "10,000+", "restoration": "100% Unlimited"}
        health_silver = {"room_rent": "1% of SI", "waiting_period": "4 Years", "network_hospitals": "6,000+", "copay": "10%"}
        life_term = {"accidental_death": "Double Sum Assured", "terminal_illness": "Covered", "claim_settlement": "99.3%"}
        auto_comprehensive = {"idv": "Market Value", "roadside_assist": "24x7", "zero_dep": "Included"}

        policies_data = [
            # HEALTH
            {"pid": 3, "type": "health", "title": "Star Comprehensive Health", "prem": 12000, "cover": health_gold},
            {"pid": 1, "type": "health", "title": "HDFC Ergo Optima Restore", "prem": 15000, "cover": health_gold},
            {"pid": 6, "type": "health", "title": "SBI Arogya Premier", "prem": 11500, "cover": health_silver},
            {"pid": 2, "type": "health", "title": "ICICI Lombard Health Shield", "prem": 13200, "cover": health_gold},
            {"pid": 7, "type": "health", "title": "Bajaj Allianz Health Guard", "prem": 9800, "cover": health_silver},
            {"pid": 5, "type": "health", "title": "Tata AIG Medicare", "prem": 14000, "cover": health_gold},
            
            # LIFE
            {"pid": 4, "type": "life", "title": "LIC Jeevan Amar", "prem": 20000, "cover": life_term},
            {"pid": 1, "type": "life", "title": "HDFC Click 2 Protect", "prem": 18500, "cover": life_term},
            {"pid": 2, "type": "life", "title": "ICICI Pru iProtect Smart", "prem": 17200, "cover": life_term},
            {"pid": 8, "type": "life", "title": "Max Life Smart Term", "prem": 16500, "cover": life_term},
            {"pid": 6, "type": "life", "title": "SBI Life eShield", "prem": 19000, "cover": life_term},
            {"pid": 5, "type": "life", "title": "Tata AIA Maha Raksha", "prem": 21000, "cover": life_term},

            # AUTO
            {"pid": 2, "type": "auto", "title": "ICICI Car Protect (Zero Dep)", "prem": 8500, "cover": auto_comprehensive},
            {"pid": 5, "type": "auto", "title": "Tata AIG Auto Secure", "prem": 9200, "cover": auto_comprehensive},
            {"pid": 1, "type": "auto", "title": "HDFC Ergo Motor Shield", "prem": 8900, "cover": auto_comprehensive},
            {"pid": 7, "type": "auto", "title": "Bajaj Allianz Drive Assure", "prem": 7800, "cover": auto_comprehensive},
        ]

        for p in policies_data:
            db.session.add(Policy(
                provider_id=p["pid"],
                policy_type=p["type"],
                title=p["title"],
                coverage=p["cover"],
                premium=p["prem"],
                term_months=12,
                deductible=5000.0,
                waiting_period_days=30 if p["type"] == 'health' else 0
            ))
        db.session.commit()

        # --- 3. CREATE TEST USER ---
        print("👤 Creating Test User...")
        user = User(
            name="Abdul Raheem",
            email="abd@gmail.com",
            password=generate_password_hash("password123"),
            risk_profile={"age": 28, "income": 1500000, "dependents": 2, "policy_types": ["health", "life"]}
        )
        db.session.add(user)
        db.session.commit()

        # --- 4. PURCHASE A POLICY FOR USER ---
        print("🛒 Simulating Purchase...")
        policy = Policy.query.first()
        new_purchase = UserPolicy(
            user_id=user.id,
            policy_id=policy.id,
            policy_number=f"POL-{random.randint(10000,99999)}",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=365),
            premium_amount=policy.premium,
            coverage_amount=500000.0,
            remaining_sum_insured=500000.0,
            status='active'
        )
        db.session.add(new_purchase)
        db.session.commit()

        print(f"✅ Database Seeded! Login: abd@gmail.com / password123")

if __name__ == '__main__':
    seed_database()