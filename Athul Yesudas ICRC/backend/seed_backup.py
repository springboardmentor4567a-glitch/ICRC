import sys
import os

# Fix path to find 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models import Provider, Policy

app = create_app()

with app.app_context():
    print("Resetting Database...")
    db.drop_all()
    db.create_all()

    print("Seeding Providers...")
    p1 = Provider(name="Allianz Secure", country="Germany")
    p2 = Provider(name="LIC Global", country="India")
    p3 = Provider(name="Geico Auto", country="USA")
    p4 = Provider(name="BlueCross Health", country="USA")
    db.session.add_all([p1, p2, p3, p4])
    db.session.commit()

    print("Seeding Policies...")
    policies = [
        # --- HEALTH ---
        Policy(
            provider_id=p4.id, policy_type='health', title="Basic Health Saver",
            premium=300.0, term_months=12, deductible=500.0,
            coverage={"hospitalization": "50k Limit", "dental": "No", "checkups": "Paid"}
        ),
        Policy(
            provider_id=p1.id, policy_type='health', title="Standard Care Plus",
            premium=500.0, term_months=12, deductible=200.0,
            coverage={"hospitalization": "Unlimited", "dental": "50% Off", "checkups": "Free"}
        ),
        Policy(
            provider_id=p4.id, policy_type='health', title="Premium Health Elite",
            premium=900.0, term_months=12, deductible=0.0,
            coverage={"hospitalization": "Unlimited (Private Room)", "dental": "Included", "global": "Yes"}
        ),

        # --- AUTO ---
        Policy(
            provider_id=p3.id, policy_type='auto', title="Third-Party Liability",
            premium=200.0, term_months=6, deductible=1000.0,
            coverage={"liability": "50k", "collision": "No", "theft": "No"}
        ),
        Policy(
            provider_id=p3.id, policy_type='auto', title="Comprehensive Drive",
            premium=450.0, term_months=12, deductible=500.0,
            coverage={"liability": "100k", "collision": "Yes", "theft": "Yes"}
        ),
        Policy(
            provider_id=p3.id, policy_type='auto', title="Luxury Auto Shield",
            premium=800.0, term_months=12, deductible=250.0,
            coverage={"liability": "1M", "collision": "Zero Dep", "roadside": "Included"}
        ),

        # --- LIFE ---
        Policy(
            provider_id=p2.id, policy_type='life', title="Term Life Basic",
            premium=100.0, term_months=120, deductible=0.0,
            coverage={"payout_type": "Lump Sum", "critical_illness": "No"}
        ),
        Policy(
            provider_id=p2.id, policy_type='life', title="Whole Life Secure",
            premium=300.0, term_months=240, deductible=0.0,
            coverage={"payout_type": "Lump Sum + Dividends", "critical_illness": "Yes"}
        ),
        Policy(
            provider_id=p2.id, policy_type='life', title="Senior Care Plan",
            premium=400.0, term_months=120, deductible=0.0,
            coverage={"payout_type": "Pension", "critical_illness": "Included"}
        ),
    ]

    db.session.add_all(policies)
    db.session.commit()
    print("Database Seeded Successfully!")
    # End of file
    #second seed file codd
    import sys
import os

# ✅ Fix path so 'app' module is always found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Policy, Provider

app = create_app()

def seed_database():
    with app.app_context():
        # Ensure tables exist
        db.create_all()

        print("🌱 Seeding Database...")

        # 1. Create Providers
        providers = [
            Provider(name="LIC Global", country="India"),
            Provider(name="HDFC Ergo", country="India"),
            Provider(name="ICICI Lombard", country="India"),
            Provider(name="Tata AIG", country="India"),
            Provider(name="Bajaj Allianz", country="India"),
            Provider(name="Star Health", country="India"),
        ]
        
        # Add provider only if it doesn't exist yet
        for p in providers:
            if not Provider.query.filter_by(name=p.name).first():
                db.session.add(p)
        db.session.commit()

        # Fetch IDs
        lic = Provider.query.filter_by(name="LIC Global").first()
        hdfc = Provider.query.filter_by(name="HDFC Ergo").first()
        icici = Provider.query.filter_by(name="ICICI Lombard").first()
        tata = Provider.query.filter_by(name="Tata AIG").first()
        bajaj = Provider.query.filter_by(name="Bajaj Allianz").first()
        star = Provider.query.filter_by(name="Star Health").first()

        # 2. Clear OLD Policies (So we don't get duplicates)
        deleted_count = Policy.query.delete()
        print(f"🧹 Cleared {deleted_count} old policies.")
        
        # 3. Create Rich Policy Data (15 Plans)
        policies = [
            # --- HEALTH PLANS ---
            Policy(provider_id=hdfc.id, policy_type="health", title="Optima Restore", premium=800.0, term_months=12, coverage={"max": 1000000}, deductible=0),
            Policy(provider_id=star.id, policy_type="health", title="Family Health Optima", premium=650.0, term_months=12, coverage={"max": 500000}, deductible=5000),
            Policy(provider_id=icici.id, policy_type="health", title="Health Shield 360", premium=450.0, term_months=12, coverage={"max": 300000}, deductible=2000),
            Policy(provider_id=tata.id, policy_type="health", title="Medicare Premier", premium=1200.0, term_months=12, coverage={"max": 5000000}, deductible=0), # High End
            Policy(provider_id=bajaj.id, policy_type="health", title="Health Guard Gold", premium=550.0, term_months=12, coverage={"max": 500000}, deductible=0),

            # --- LIFE PLANS ---
            Policy(provider_id=lic.id, policy_type="life", title="Jeevan Umang", premium=12000.0, term_months=240, coverage={"max": 5000000}, deductible=0),
            Policy(provider_id=hdfc.id, policy_type="life", title="Click 2 Protect", premium=8000.0, term_months=360, coverage={"max": 10000000}, deductible=0), # Term Life
            Policy(provider_id=icici.id, policy_type="life", title="iProtect Smart", premium=7500.0, term_months=480, coverage={"max": 10000000}, deductible=0),
            Policy(provider_id=tata.id, policy_type="life", title="Maha Raksha Supreme", premium=9000.0, term_months=300, coverage={"max": 7500000}, deductible=0),
            Policy(provider_id=bajaj.id, policy_type="life", title="Smart Protect Goal", premium=6000.0, term_months=360, coverage={"max": 5000000}, deductible=0),

            # --- AUTO PLANS ---
            Policy(provider_id=icici.id, policy_type="auto", title="Car Protect Comprehensive", premium=15000.0, term_months=12, coverage={"max": 800000}, deductible=1000),
            Policy(provider_id=hdfc.id, policy_type="auto", title="Motor Drive Assure", premium=12000.0, term_months=12, coverage={"max": 600000}, deductible=2000),
            Policy(provider_id=tata.id, policy_type="auto", title="Auto Secure Zero Dep", premium=18000.0, term_months=12, coverage={"max": 1200000}, deductible=0),
            Policy(provider_id=bajaj.id, policy_type="auto", title="Drive Smart Basic", premium=5000.0, term_months=12, coverage={"max": 200000}, deductible=5000), # 3rd Party
            Policy(provider_id=lic.id, policy_type="auto", title="Wheel Guard Plus", premium=9500.0, term_months=12, coverage={"max": 500000}, deductible=1500),
        ]

        db.session.add_all(policies)
        db.session.commit()
        print("✅ Database Seeded with 15 Real-World Plans!")

if __name__ == "__main__":
    seed_database()