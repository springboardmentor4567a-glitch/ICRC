from app import create_app, db
from app.models import User, Policy, UserPolicy, Provider
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random

app = create_app()

def seed_data():
    with app.app_context():
        print("🌱 Seeding & Fixing Test Data...")

        # --- 1. ENSURE PROVIDER ---
        provider = Provider.query.filter_by(name="HDFC Ergo").first()
        if not provider:
            provider = Provider(name="HDFC Ergo", country="India")
            db.session.add(provider)
            db.session.flush()
            print(f"✅ Created Provider: HDFC Ergo")

        # --- 2. ENSURE USERS ---
        users_data = [
            {"email": "abc@gmail.com", "name": "ABC User", "password": "1234"},
            {"email": "test@example.com", "name": "Test User", "password": "test123"},
            {"email": "asd@gmail.com", "name": "ASD User", "password": "1234"}
        ]

        db_users = {}
        for u in users_data:
            user = User.query.filter_by(email=u["email"]).first()
            if not user:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    password=generate_password_hash(u["password"]),
                    is_admin=False
                )
                db.session.add(user)
                print(f"✅ Created User: {u['email']}")
            db_users[u["email"]] = user
        
        db.session.flush()

        # --- 3. ENSURE POLICIES ---
        policies_data = [
            {"title": "Gold Health 50L", "amount": 5000000, "premium": 25000, "type": "health"},
            {"title": "Platinum Life 1Cr", "amount": 10000000, "premium": 50000, "type": "life"},
            {"title": "Diamond Auto 2Cr", "amount": 20000000, "premium": 120000, "type": "auto"}
        ]

        db_policies = {}
        for p in policies_data:
            policy = Policy.query.filter_by(title=p["title"]).first()
            if not policy:
                policy = Policy(
                    provider_id=provider.id,
                    policy_type=p["type"],
                    title=p["title"],
                    premium=p["premium"],
                    term_months=12,
                    coverage={"max": p["amount"]}, 
                    deductible=5000
                )
                db.session.add(policy)
            db_policies[p["amount"]] = policy
        
        db.session.flush()

        # --- 4. BUY & FIX POLICIES ---
        
        # Scenario A: abc@gmail.com - 50L - 9 Months ago
        u1 = db_users["abc@gmail.com"]
        p1 = db_policies[5000000]
        start_date_1 = datetime.utcnow() - timedelta(days=270)
        
        up1 = UserPolicy.query.filter_by(user_id=u1.id, policy_id=p1.id).first()
        if not up1:
            up1 = UserPolicy(
                user_id=u1.id, policy_id=p1.id,
                policy_number=f"POL-ABC-{random.randint(1000,9999)}",
                start_date=start_date_1,
                end_date=datetime.utcnow() + timedelta(days=365), # Ends Next Year
                coverage_amount=5000000, remaining_sum_insured=5000000, status='active'
            )
            db.session.add(up1)
            print(f"✅ Bought: 50L Policy for abc@gmail.com")
        else:
            # FIX EXISTING DATE
            up1.start_date = start_date_1
            up1.end_date = datetime.utcnow() + timedelta(days=365) # Extend 1 year from NOW
            up1.status = 'active'
            print(f"🔄 Fixed: abc@gmail.com extended to {up1.end_date.date()}")

        # Scenario B: test@example.com - 1Cr - 1 Year ago (The one causing issues)
        u2 = db_users["test@example.com"]
        p2 = db_policies[10000000]
        start_date_2 = datetime.utcnow() - timedelta(days=370)
        
        up2 = UserPolicy.query.filter_by(user_id=u2.id, policy_id=p2.id).first()
        if not up2:
            up2 = UserPolicy(
                user_id=u2.id, policy_id=p2.id,
                policy_number=f"POL-TEST-{random.randint(1000,9999)}",
                start_date=start_date_2,
                end_date=datetime.utcnow() + timedelta(days=365), # Ends Next Year
                coverage_amount=10000000, remaining_sum_insured=10000000, status='active'
            )
            db.session.add(up2)
            print(f"✅ Bought: 1Cr Policy for test@example.com")
        else:
            # FIX EXISTING DATE
            up2.start_date = start_date_2
            up2.end_date = datetime.utcnow() + timedelta(days=365) # Extend 1 year from NOW
            up2.status = 'active'
            print(f"🔄 Fixed: test@example.com extended to {up2.end_date.date()}")

        # Scenario C: asd@gmail.com - 2Cr - 1 Month ago
        u3 = db_users["asd@gmail.com"]
        p3 = db_policies[20000000]
        start_date_3 = datetime.utcnow() - timedelta(days=30)
        
        up3 = UserPolicy.query.filter_by(user_id=u3.id, policy_id=p3.id).first()
        if not up3:
            up3 = UserPolicy(
                user_id=u3.id, policy_id=p3.id,
                policy_number=f"POL-ASD-{random.randint(1000,9999)}",
                start_date=start_date_3,
                end_date=start_date_3 + timedelta(days=365),
                coverage_amount=20000000, remaining_sum_insured=20000000, status='active'
            )
            db.session.add(up3)
            print(f"✅ Bought: 2Cr Policy for asd@gmail.com")
        else:
            up3.start_date = start_date_3
            up3.end_date = start_date_3 + timedelta(days=365)
            print(f"ℹ️ Verified: asd@gmail.com dates are correct.")

        db.session.commit()
        print("\n🎉 Database Dates Fixed Successfully!")

if __name__ == "__main__":
    seed_data()