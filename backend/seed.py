# seed.py
import os
import sys
from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
import models
from sqlalchemy.orm import Session

# ensure tables exist
models.Base.metadata.create_all(bind=engine)

def seed():
    db: Session = SessionLocal()
    try:
        # check if providers exist
        if db.query(models.Provider).count() > 0:
            print("Already seeded")
            return

        # Sample providers
        p1 = models.Provider(name="LIC", code="LIC", description="Life Insurance Corporation of India")
        p2 = models.Provider(name="HDFC Life", code="HDFC", description="HDFC Life Insurance")
        p3 = models.Provider(name="Star Health", code="STAR", description="Star Health Insurance")
        p4 = models.Provider(name="Tata AIA", code="TATA", description="Tata AIA Insurance")
        db.add_all([p1,p2,p3,p4])
        db.commit()

        # Fetch providers (to get ids)
        p1 = db.query(models.Provider).filter_by(code="LIC").first()
        p2 = db.query(models.Provider).filter_by(code="HDFC").first()
        p3 = db.query(models.Provider).filter_by(code="STAR").first()
        p4 = db.query(models.Provider).filter_by(code="TATA").first()

        # Sample policies
        policies = [
            models.Policy(provider_id=p1.id, name="LIC Jeevan Anand", policy_number="LIC984523",
                          category="Life", coverage="5,00,000", premium=12000.0,
                          benefits="Maturity benefit, Death cover"),
            models.Policy(provider_id=p2.id, name="HDFC Life Sanchay Plus", policy_number="HDFC778899",
                          category="Life", coverage="10,00,000", premium=18000.0,
                          benefits="Guaranteed savings with life cover"),
            models.Policy(provider_id=p3.id, name="Star Health Family Optima", policy_number="STAR444221",
                          category="Health", coverage="5,00,000", premium=14000.0,
                          benefits="Family floater, Cashless hospitals"),
            models.Policy(provider_id=p4.id, name="Tata AIA Smart Protect", policy_number="TATA557733",
                          category="Life", coverage="7,50,000", premium=8500.0,
                          benefits="Term + accidental cover"),
            models.Policy(provider_id=p3.id, name="Star Health Critical Care", policy_number="STAR998877",
                          category="Health", coverage="3,00,000", premium=9000.0,
                          benefits="Critical illness package"),
        ]
        db.add_all(policies)
        db.commit()
        print("Seeded providers & policies successfully")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
