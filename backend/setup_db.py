# # # setup_db.py
# # """
# # Run this file once to create tables.

# # Usage:
# #     python setup_db.py
# # """
# # from app import create_app
# # from app.extensions import db

# # app = create_app()

# # with app.app_context():
# #     db.create_all()
# #     print("Database tables created/verified.")
# #     ##update 3
# #     import sys
# # import os
# # from datetime import datetime, timedelta

# # # Fix path so 'app' module is always found
# # sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# # from app import create_app, db
# # from app.models import Policy, Provider, User, UserPolicy, Notification, Claim, ClaimDocument

# # app = create_app()

# # def seed_database():
# #     with app.app_context():
# #         print("🗑️  Wiping Database (Dropping all tables)...")
# #         # ✅ FIX: Drops old tables so we don't get Foreign Key errors
# #         # AND it ensures the new columns (premium_paid, etc.) are created.
# #         db.drop_all()
        
# #         print("🛠️  Creating New Schema...")
# #         db.create_all()

# #         print("🌱 Seeding Database...")

# #         # ---------------------------------------------------------
# #         # 1. Create Providers
# #         # ---------------------------------------------------------
# #         providers = [
# #             Provider(name="LIC Global", country="India"),
# #             Provider(name="HDFC Ergo", country="India"),
# #             Provider(name="ICICI Lombard", country="India"),
# #             Provider(name="Tata AIG", country="India"),
# #             Provider(name="Bajaj Allianz", country="India"),
# #             Provider(name="Star Health", country="India"),
# #         ]
        
# #         db.session.add_all(providers)
# #         db.session.commit()

# #         # Fetch IDs
# #         lic = Provider.query.filter_by(name="LIC Global").first()
# #         hdfc = Provider.query.filter_by(name="HDFC Ergo").first()
# #         icici = Provider.query.filter_by(name="ICICI Lombard").first()
# #         tata = Provider.query.filter_by(name="Tata AIG").first()
# #         bajaj = Provider.query.filter_by(name="Bajaj Allianz").first()
# #         star = Provider.query.filter_by(name="Star Health").first()

# #         # ---------------------------------------------------------
# #         # 2. Create Policies
# #         # ---------------------------------------------------------
# #         policies = [
# #             Policy(provider_id=hdfc.id, policy_type="health", title="Optima Restore", premium=800.0, term_months=12, coverage={"max": 1000000}, deductible=0),
# #             Policy(provider_id=star.id, policy_type="health", title="Family Health Optima", premium=650.0, term_months=12, coverage={"max": 500000}, deductible=5000),
# #             Policy(provider_id=icici.id, policy_type="health", title="Health Shield 360", premium=450.0, term_months=12, coverage={"max": 300000}, deductible=2000),
# #             Policy(provider_id=tata.id, policy_type="health", title="Medicare Premier", premium=1200.0, term_months=12, coverage={"max": 5000000}, deductible=0),
# #             Policy(provider_id=bajaj.id, policy_type="health", title="Health Guard Gold", premium=550.0, term_months=12, coverage={"max": 500000}, deductible=0),
            
# #             Policy(provider_id=lic.id, policy_type="life", title="Jeevan Umang", premium=12000.0, term_months=240, coverage={"max": 5000000}, deductible=0),
# #             Policy(provider_id=hdfc.id, policy_type="life", title="Click 2 Protect", premium=8000.0, term_months=360, coverage={"max": 10000000}, deductible=0),
# #             Policy(provider_id=icici.id, policy_type="life", title="iProtect Smart", premium=7500.0, term_months=480, coverage={"max": 10000000}, deductible=0),
            
# #             Policy(provider_id=icici.id, policy_type="auto", title="Car Protect Comprehensive", premium=15000.0, term_months=12, coverage={"max": 800000}, deductible=1000),
# #             Policy(provider_id=tata.id, policy_type="auto", title="Auto Secure Zero Dep", premium=18000.0, term_months=12, coverage={"max": 1200000}, deductible=0),
# #             Policy(provider_id=lic.id, policy_type="auto", title="Wheel Guard Plus", premium=9500.0, term_months=12, coverage={"max": 500000}, deductible=1500),
# #         ]

# #         db.session.add_all(policies)
# #         db.session.commit()
# #         print("✅ Policies Seeded")

# #         # ---------------------------------------------------------
# #         # 3. Create a Test User (Since we wiped DB, we need to recreate User)
# #         # ---------------------------------------------------------
# #         # You can customize this default user
# #         from werkzeug.security import generate_password_hash
        
# #         test_user = User(
# #             name="Test User",
# #             email="abd@gmail.com",
# #             password=generate_password_hash("1234"),
# #             risk_profile={
# #                 "age": 30,
# #                 "income": 1200000,
# #                 "occupation": "salaried",
# #                 "policy_types": ["auto", "health"]
# #             }
# #         )
# #         db.session.add(test_user)
# #         db.session.commit()
# #         print(f"👤 Created Test User: {test_user.email} / password123")

# #         # ---------------------------------------------------------
# #         # 4. Assign Test Purchase
# #         # ---------------------------------------------------------
# #         target_policy = Policy.query.filter_by(title="Auto Secure Zero Dep").first()
        
# #         if target_policy:
# #             # Default coverage extraction logic
# #             cov_limit = 1200000 # Hardcoded for this specific seed policy
            
# #             new_purchase = UserPolicy(
# #                 user_id=test_user.id,
# #                 policy_id=target_policy.id,
# #                 policy_number="POL-AUTO-SEED-01",
# #                 start_date=datetime.utcnow(),
# #                 end_date=datetime.utcnow() + timedelta(days=365),
                
# #                 # ✅ NEW FIELDS REQUIRED BY MODELS.PY
# #                 premium_paid=target_policy.premium,
# #                 coverage_amount=cov_limit,
# #                 max_claims_allowed=5,
                
# #                 status="active"
# #             )
            
# #             # ✅ Add Notification
# #             notif = Notification(
# #                 user_id=test_user.id,
# #                 title="Welcome!",
# #                 message="Welcome to your new Insurance Dashboard."
# #             )
            
# #             db.session.add(new_purchase)
# #             db.session.add(notif)
# #             db.session.commit()
# #             print(f"🎉 Test Purchase Assigned to {test_user.name}")

# # if __name__ == "__main__":
# #     seed_database()
# import sys
# import os
# from datetime import datetime, timedelta
# from werkzeug.security import generate_password_hash

# # Fix path so 'app' module is always found
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# from app import create_app, db
# from app.models import Policy, Provider, User, UserPolicy, Notification, Claim, ClaimDocument

# app = create_app()

# def seed_database():
#     with app.app_context():
#         print("🗑️  Wiping Database (Dropping all tables)...")
#         # Drops old tables to ensure new schema (with premium_paid, etc.) is applied
#         db.drop_all()
        
#         print("🛠️  Creating New Schema...")
#         db.create_all()

#         print("🌱 Seeding Database with 30 Policies...")

#         # ---------------------------------------------------------
#         # 1. Create Providers
#         # ---------------------------------------------------------
#         providers = [
#             Provider(name="LIC Global", country="India"),
#             Provider(name="HDFC Ergo", country="India"),
#             Provider(name="ICICI Lombard", country="India"),
#             Provider(name="Tata AIG", country="India"),
#             Provider(name="Bajaj Allianz", country="India"),
#             Provider(name="Star Health", country="India"),
#             Provider(name="Max Life", country="India"),
#             Provider(name="SBI General", country="India"),
#         ]
        
#         db.session.add_all(providers)
#         db.session.commit()

#         # Fetch IDs for linking
#         lic = Provider.query.filter_by(name="LIC Global").first()
#         hdfc = Provider.query.filter_by(name="HDFC Ergo").first()
#         icici = Provider.query.filter_by(name="ICICI Lombard").first()
#         tata = Provider.query.filter_by(name="Tata AIG").first()
#         bajaj = Provider.query.filter_by(name="Bajaj Allianz").first()
#         star = Provider.query.filter_by(name="Star Health").first()
#         max_life = Provider.query.filter_by(name="Max Life").first()
#         sbi = Provider.query.filter_by(name="SBI General").first()

#         # ---------------------------------------------------------
#         # 2. Create Policies (30 Items: 10 Health, 10 Life, 10 Auto)
#         # ---------------------------------------------------------
#         policies = [
#             # --- HEALTH PLANS (10) ---
#             Policy(provider_id=hdfc.id, policy_type="health", title="Optima Restore", premium=12000.0, term_months=12, coverage={"max": 500000}, deductible=0),
#             Policy(provider_id=star.id, policy_type="health", title="Family Health Optima", premium=15000.0, term_months=12, coverage={"max": 1000000}, deductible=5000),
#             Policy(provider_id=icici.id, policy_type="health", title="Health Shield 360", premium=9000.0, term_months=12, coverage={"max": 300000}, deductible=2000),
#             Policy(provider_id=tata.id, policy_type="health", title="Medicare Premier", premium=25000.0, term_months=12, coverage={"max": 5000000}, deductible=0), 
#             Policy(provider_id=bajaj.id, policy_type="health", title="Health Guard Gold", premium=8500.0, term_months=12, coverage={"max": 400000}, deductible=0),
#             Policy(provider_id=sbi.id, policy_type="health", title="Arogya Sanjeevani", premium=6000.0, term_months=12, coverage={"max": 500000}, deductible=5000),
#             Policy(provider_id=hdfc.id, policy_type="health", title="my:health Suraksha", premium=11000.0, term_months=12, coverage={"max": 700000}, deductible=0),
#             Policy(provider_id=star.id, policy_type="health", title="Senior Citizen Red Carpet", premium=18000.0, term_months=12, coverage={"max": 1000000}, deductible=10000),
#             Policy(provider_id=max_life.id, policy_type="health", title="Max Bupa ReAssure", premium=14500.0, term_months=12, coverage={"max": 1500000}, deductible=0),
#             Policy(provider_id=icici.id, policy_type="health", title="Lombard Complete Health", premium=9500.0, term_months=12, coverage={"max": 500000}, deductible=1000),

#             # --- LIFE PLANS (10) ---
#             Policy(provider_id=lic.id, policy_type="life", title="Jeevan Umang", premium=12000.0, term_months=240, coverage={"max": 5000000}, deductible=0),
#             Policy(provider_id=hdfc.id, policy_type="life", title="Click 2 Protect", premium=8000.0, term_months=360, coverage={"max": 10000000}, deductible=0),
#             Policy(provider_id=icici.id, policy_type="life", title="iProtect Smart", premium=7500.0, term_months=480, coverage={"max": 10000000}, deductible=0),
#             Policy(provider_id=tata.id, policy_type="life", title="Maha Raksha Supreme", premium=9000.0, term_months=300, coverage={"max": 7500000}, deductible=0),
#             Policy(provider_id=bajaj.id, policy_type="life", title="Smart Protect Goal", premium=6000.0, term_months=360, coverage={"max": 5000000}, deductible=0),
#             Policy(provider_id=max_life.id, policy_type="life", title="Max Life Smart Term", premium=11000.0, term_months=400, coverage={"max": 15000000}, deductible=0),
#             Policy(provider_id=lic.id, policy_type="life", title="Tech Term Plan", premium=7000.0, term_months=300, coverage={"max": 5000000}, deductible=0),
#             Policy(provider_id=sbi.id, policy_type="life", title="SBI Life eShield", premium=8500.0, term_months=360, coverage={"max": 8000000}, deductible=0),
#             Policy(provider_id=hdfc.id, policy_type="life", title="Life Sanchay Plus", premium=25000.0, term_months=120, coverage={"max": 2500000}, deductible=0),
#             Policy(provider_id=tata.id, policy_type="life", title="Sampoorna Raksha", premium=9500.0, term_months=360, coverage={"max": 10000000}, deductible=0),

#             # --- AUTO PLANS (10) ---
#             Policy(provider_id=icici.id, policy_type="auto", title="Car Protect Comprehensive", premium=15000.0, term_months=12, coverage={"max": 800000}, deductible=1000),
#             Policy(provider_id=hdfc.id, policy_type="auto", title="Motor Drive Assure", premium=12000.0, term_months=12, coverage={"max": 600000}, deductible=2000),
#             Policy(provider_id=tata.id, policy_type="auto", title="Auto Secure Zero Dep", premium=18000.0, term_months=12, coverage={"max": 1200000}, deductible=0),
#             Policy(provider_id=bajaj.id, policy_type="auto", title="Drive Smart Basic", premium=5000.0, term_months=12, coverage={"max": 200000}, deductible=5000),
#             Policy(provider_id=lic.id, policy_type="auto", title="Wheel Guard Plus", premium=9500.0, term_months=12, coverage={"max": 500000}, deductible=1500),
#             Policy(provider_id=sbi.id, policy_type="auto", title="SBI General Motor", premium=11000.0, term_months=12, coverage={"max": 700000}, deductible=1000),
#             Policy(provider_id=star.id, policy_type="auto", title="Star Motor Protect", premium=13000.0, term_months=12, coverage={"max": 900000}, deductible=0),
#             Policy(provider_id=icici.id, policy_type="auto", title="Go Digit Car Insurance", premium=8000.0, term_months=12, coverage={"max": 400000}, deductible=2500),
#             Policy(provider_id=tata.id, policy_type="auto", title="Commercial Truck Cover", premium=35000.0, term_months=12, coverage={"max": 2500000}, deductible=5000),
#             Policy(provider_id=bajaj.id, policy_type="auto", title="Two Wheeler Long Term", premium=3000.0, term_months=36, coverage={"max": 80000}, deductible=500),
#         ]

#         db.session.add_all(policies)
#         db.session.commit()
#         print(f"✅ Database Seeded with {len(policies)} Policies!")

#         # ---------------------------------------------------------
#         # 3. Create a Test User
#         # ---------------------------------------------------------
#         test_user = User(
#             name="Test User",
#             email="abd@gmail.com",
#             password=generate_password_hash("1234"),
#             risk_profile={
#                 "age": 30,
#                 "income": 1200000,
#                 "occupation": "salaried",
#                 "policy_types": ["auto", "health"]
#             }
#         )
#         db.session.add(test_user)
#         db.session.commit()
#         print(f"👤 Created Test User: {test_user.email} / password123")

#         # ---------------------------------------------------------
#         # 4. Assign Test Purchase (Auto Policy)
#         # ---------------------------------------------------------
#         target_policy = Policy.query.filter_by(title="Auto Secure Zero Dep").first()
        
#         if target_policy:
#             # Manually calculate limit based on the policy seeded above
#             # Title: Auto Secure Zero Dep, Coverage: 1200000
#             cov_limit = 1200000 
            
#             new_purchase = UserPolicy(
#                 user_id=test_user.id,
#                 policy_id=target_policy.id,
#                 policy_number="POL-AUTO-SEED-01",
#                 start_date=datetime.utcnow(),
#                 end_date=datetime.utcnow() + timedelta(days=365),
                
#                 # New Fields
#                 premium_amount=target_policy.premium,
#                 coverage_amount=cov_limit,
#                 max_claims_allowed=5,
                
#                 # Payments
#                 payment_frequency='yearly',
#                 next_payment_date=datetime.utcnow() + timedelta(days=365),
#                 is_overdue=False,

#                 status="active"
#             )
            
#             # Add Notification
#             notif = Notification(
#                 user_id=test_user.id,
#                 title="Welcome!",
#                 message="Welcome to your new Insurance Dashboard."
#             )
            
#             db.session.add(new_purchase)
#             db.session.add(notif)
#             db.session.commit()
#             print(f"🎉 Test Purchase Assigned to {test_user.name}")

# if __name__ == "__main__":
#     seed_database()