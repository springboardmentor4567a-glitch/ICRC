# seed.py
from database import SessionLocal, engine
import models
from sqlalchemy.orm import Session

models.Base.metadata.create_all(bind=engine)

def seed():
    db: Session = SessionLocal()
    try:
        # 🔥 CLEAR OLD DATA (important)
        db.query(models.Policy).delete()
        db.query(models.Provider).delete()
        db.commit()

        # Providers
        providers = [
            models.Provider(name="LIC", code="LIC", description="Life Insurance Corporation"),
            models.Provider(name="HDFC Life", code="HDFC", description="HDFC Life Insurance"),
            models.Provider(name="Star Health", code="STAR", description="Star Health Insurance"),
            models.Provider(name="Tata AIA", code="TATA", description="Tata AIA Insurance"),
            models.Provider(name="ICICI Prudential", code="ICICI", description="ICICI Insurance"),
        ]
        db.add_all(providers)
        db.commit()

        # Map providers by code
        p = {x.code: x for x in db.query(models.Provider).all()}

        # 15 Policies (✔ correct provider_id usage)
        policies = [
            models.Policy(
                provider_id=p["LIC"].id,
                name="LIC Jeevan Anand",
                policy_number="LIC1001",
                category="Life",
                coverage="5,00,000",
                premium=12000,
                benefits="Maturity + Death cover"
            ),
            models.Policy(
                provider_id=p["LIC"].id,
                name="LIC Health Shield",
                policy_number="LIC1002",
                category="Health",
                coverage="10,00,000",
                premium=16000,
                benefits="Cashless hospitals"
            ),
            models.Policy(
                provider_id=p["HDFC"].id,
                name="HDFC Life Sanchay",
                policy_number="HDFC2001",
                category="Life",
                coverage="12,00,000",
                premium=18000,
                benefits="Guaranteed returns"
            ),
            models.Policy(
                provider_id=p["HDFC"].id,
                name="HDFC Health Secure",
                policy_number="HDFC2002",
                category="Health",
                coverage="8,00,000",
                premium=14000,
                benefits="Family floater"
            ),
            models.Policy(
                provider_id=p["STAR"].id,
                name="Star Health Family",
                policy_number="STAR3001",
                category="Health",
                coverage="5,00,000",
                premium=9000,
                benefits="Family coverage"
            ),
            models.Policy(
                provider_id=p["STAR"].id,
                name="Star Health Senior",
                policy_number="STAR3002",
                category="Health",
                coverage="3,00,000",
                premium=8000,
                benefits="Senior citizens"
            ),
            models.Policy(
                provider_id=p["TATA"].id,
                name="Tata AIA Life Plus",
                policy_number="TATA4001",
                category="Life",
                coverage="15,00,000",
                premium=20000,
                benefits="High life cover"
            ),
            models.Policy(
                provider_id=p["TATA"].id,
                name="Tata AIA Health Plus",
                policy_number="TATA4002",
                category="Health",
                coverage="7,00,000",
                premium=13000,
                benefits="OPD + Hospital"
            ),
            models.Policy(
                provider_id=p["ICICI"].id,
                name="ICICI iProtect",
                policy_number="ICICI5001",
                category="Life",
                coverage="20,00,000",
                premium=22000,
                benefits="Term insurance"
            ),
            models.Policy(
                provider_id=p["ICICI"].id,
                name="ICICI Health Boost",
                policy_number="ICICI5002",
                category="Health",
                coverage="10,00,000",
                premium=15000,
                benefits="Critical illness"
            ),
            models.Policy(
                provider_id=p["LIC"].id,
                name="LIC Child Secure",
                policy_number="LIC1003",
                category="Life",
                coverage="6,00,000",
                premium=11000,
                benefits="Child education"
            ),
            models.Policy(
                provider_id=p["HDFC"].id,
                name="HDFC Click Health",
                policy_number="HDFC2003",
                category="Health",
                coverage="6,00,000",
                premium=12500,
                benefits="Quick claims"
            ),
            models.Policy(
                provider_id=p["STAR"].id,
                name="Star Health Assure",
                policy_number="STAR3003",
                category="Health",
                coverage="4,00,000",
                premium=10000,
                benefits="Accident cover"
            ),
            models.Policy(
                provider_id=p["TATA"].id,
                name="Tata AIA Gold",
                policy_number="TATA4003",
                category="Life",
                coverage="18,00,000",
                premium=21000,
                benefits="Premium life plan"
            ),
            models.Policy(
                provider_id=p["ICICI"].id,
                name="ICICI Life Guard",
                policy_number="ICICI5003",
                category="Life",
                coverage="25,00,000",
                premium=25000,
                benefits="Long-term protection"
            ),
        ]

        db.add_all(policies)
        db.commit()
        print("✅ Seeded 15 policies successfully")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
