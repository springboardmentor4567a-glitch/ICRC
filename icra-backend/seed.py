from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    if db.query(models.Policy).count() > 0:
        print("Policies already exist. Skipping seed.")
        db.close()
        return

    print("Seeding 50+ Policies...")

    policies = [
        {"category": "Health", "provider": "HDFC ERGO", "policy_name": "Optima Restore", "premium": 12000, "cover_amount": 500000, "description": "Restores your sum insured instantly after a claim.", "features": "Cashless;Restore Benefit;No Claim Bonus"},
        {"category": "Health", "provider": "Star Health", "policy_name": "Family Health Optima", "premium": 15000, "cover_amount": 1000000, "description": "Comprehensive family floater plan with maternity benefits.", "features": "Maternity Cover;Newborn Cover;Health Checkup"},
        {"category": "Health", "provider": "Niva Bupa", "policy_name": "ReAssure 2.0", "premium": 11500, "cover_amount": 500000, "description": "Unlimited sum insured reinstatement forever.", "features": "Unlimited Refill;Booster Benefit;Safeguard"},
        {"category": "Health", "provider": "Care Health", "policy_name": "Care Supreme", "premium": 9000, "cover_amount": 700000, "description": "High coverage with unlimited automatic recharge.", "features": "Unlimited Recharge;AYUSH Treatment;No Claim Bonus"},
        {"category": "Health", "provider": "Aditya Birla", "policy_name": "Activ Health Platinum", "premium": 13500, "cover_amount": 1000000, "description": "Earn rewards for staying healthy (HealthReturns).", "features": "HealthReturns;Chronic Management;Mental Illness"},
        {"category": "Health", "provider": "ICICI Lombard", "policy_name": "Complete Health", "premium": 12800, "cover_amount": 500000, "description": "Complete protection with guaranteed cumulative bonus.", "features": "Guaranteed Bonus;Reset Benefit;Wellness Program"},
        {"category": "Health", "provider": "Tata AIG", "policy_name": "Medicare Premier", "premium": 16000, "cover_amount": 1500000, "description": "Global coverage for planned hospitalization.", "features": "Global Cover;Vaccination Cover;Consumables Benefit"},
        {"category": "Health", "provider": "Bajaj Allianz", "policy_name": "Health Guard", "premium": 11000, "cover_amount": 500000, "description": "Traditional comprehensive health plan.", "features": "Convalescence Benefit;Daily Cash;Maternity"},
        {"category": "Health", "provider": "ManipalCigna", "policy_name": "ProHealth Prime", "premium": 14500, "cover_amount": 1000000, "description": "Covers non-medical expenses and OPD.", "features": "OPD Cover;Non-Medical Items;Switch Off Benefit"},
        {"category": "Health", "provider": "Digit", "policy_name": "Digit Health Care", "premium": 8500, "cover_amount": 500000, "description": "Simple, flat-rate premiums with super fast claims.", "features": "No Room Rent Limit;Cumulative Bonus;Paperless Claims"},
        {"category": "Life", "provider": "LIC", "policy_name": "Jeevan Umang", "premium": 25000, "cover_amount": 5000000, "description": "Whole life assurance with survival benefits.", "features": "Whole Life Cover;Survival Benefit;Loan Facility"},
        {"category": "Life", "provider": "HDFC Life", "policy_name": "Click 2 Protect", "premium": 18000, "cover_amount": 10000000, "description": "Pure term plan with 99% claim settlement ratio.", "features": "Critical Illness;Accidental Death;Waiver of Premium"},
        {"category": "Life", "provider": "ICICI Pru", "policy_name": "iProtect Smart", "premium": 17500, "cover_amount": 10000000, "description": "Comprehensive term plan covering 34 critical illnesses.", "features": "Terminal Illness;Permanent Disability;Tax Benefits"},
        {"category": "Life", "provider": "Max Life", "policy_name": "Smart Secure Plus", "premium": 19000, "cover_amount": 10000000, "description": "Flexible term plan with return of premium option.", "features": "Return of Premium;Joint Life Cover;Special Exit Value"},
        {"category": "Life", "provider": "Tata AIA", "policy_name": "Sampoorna Raksha", "premium": 21000, "cover_amount": 10000000, "description": "Life cover up to 100 years of age.", "features": "Whole Life Option;Lower Rates for Women;High Claim Ratio"},
        {"category": "Life", "provider": "SBI Life", "policy_name": "eShield Next", "premium": 16500, "cover_amount": 7500000, "description": "Level, increasing, or future-proofing cover options.", "features": "Increasing Cover;Better Half Benefit;Death Benefit"},
        {"category": "Life", "provider": "Kotak Life", "policy_name": "e-Term Plan", "premium": 15000, "cover_amount": 5000000, "description": "Affordable online term plan.", "features": "Step-Up Option;Critical Illness Plus;Payout Options"},
        {"category": "Life", "provider": "Bajaj Allianz", "policy_name": "Smart Protect Goal", "premium": 14000, "cover_amount": 5000000, "description": "Term plan with child education support.", "features": "Child Education Benefit;ROP;Add-on Covers"},
        {"category": "Life", "provider": "PNB MetLife", "policy_name": "Mera Term Plan", "premium": 15500, "cover_amount": 6000000, "description": "Customizable plan for self-employed individuals.", "features": "Joint Life;Life Stage Benefit;Spouse Cover"},
        {"category": "Life", "provider": "Aegon Life", "policy_name": "iTerm Prime", "premium": 12000, "cover_amount": 5000000, "description": "Zero cost exit option available.", "features": "Zero Cost Exit;Covid-19 Cover;Quick Issuance"},
        {"category": "Auto", "provider": "Acko", "policy_name": "Acko Smart Saver", "premium": 2900, "cover_amount": 500000, "description": "Incredibly low premiums for smart drivers.", "features": "Zero Commission;Instant Settlement;Doorstep Pickup"},
        {"category": "Auto", "provider": "Digit", "policy_name": "Digit Car Protect", "premium": 3500, "cover_amount": 600000, "description": "Smartphone-enabled self-inspection claims.", "features": "Self-Inspection;Advance Cash;6-Month Warranty"},
        {"category": "Auto", "provider": "ICICI Lombard", "policy_name": "Motor Floater", "premium": 4500, "cover_amount": 800000, "description": "Single policy for all your vehicles.", "features": "Single Premium;Pay As You Use;Roadside Assistance"},
        {"category": "Auto", "provider": "HDFC ERGO", "policy_name": "Motor Shield", "premium": 5000, "cover_amount": 1000000, "description": "Overnight repair service guaranteed.", "features": "Overnight Repair;Zero Depreciation;Engine Protection"},
        {"category": "Auto", "provider": "Bajaj Allianz", "policy_name": "Drive Assure", "premium": 4200, "cover_amount": 750000, "description": "Value-added services including key replacement.", "features": "24x7 Spot Assistance;Key Replacement;Personal Baggage"},
        {"category": "Auto", "provider": "Tata AIG", "policy_name": "Auto Secure", "premium": 4800, "cover_amount": 900000, "description": "Comprehensive damage protection with 12 add-ons.", "features": "Daily Allowance;Return to Invoice;Glass Repair"},
        {"category": "Auto", "provider": "Reliance General", "policy_name": "Private Car Policy", "premium": 3800, "cover_amount": 600000, "description": "Cashless garages across 3500+ locations.", "features": "Free RSA;NCB Retention;Instant Renewal"},
        {"category": "Auto", "provider": "Liberty", "policy_name": "Private Car Package", "premium": 4000, "cover_amount": 700000, "description": "Hassle-free claims with 7-day settlement guarantee.", "features": "Consumables Cover;Loss of Personal Belongings;Towing"},
        {"category": "Auto", "provider": "Kotak General", "policy_name": "Kotak Car Secure", "premium": 3200, "cover_amount": 500000, "description": "Protect your car against damages and theft.", "features": "Tyre Cover;Engine Protect;Return to Invoice"},
        {"category": "Auto", "provider": "SBI General", "policy_name": "Private Car Insurance", "premium": 4600, "cover_amount": 800000, "description": "Pricing based on your car's age and zone.", "features": "Bi-fuel Kit Cover;Legal Liability;PA Cover"},
        {"category": "Travel", "provider": "Tata AIG", "policy_name": "Travel Guard", "premium": 1500, "cover_amount": 3500000, "description": "Covers flight delays, baggage loss, and medical.", "features": "Baggage Loss;Flight Delay;Medical Evacuation"},
        {"category": "Travel", "provider": "HDFC ERGO", "policy_name": "Travel Suraksha", "premium": 1200, "cover_amount": 3000000, "description": "Comprehensive travel protection worldwide.", "features": "Cashless Hospitalization;Passport Loss;Hijack Distress"},
        {"category": "Travel", "provider": "Reliance", "policy_name": "International Travel", "premium": 1100, "cover_amount": 2500000, "description": "Pay only for the days you travel.", "features": "Trip Cancellation;Missed Connection;Dental Treatment"},
        {"category": "Travel", "provider": "Care Health", "policy_name": "Explore", "premium": 1800, "cover_amount": 4000000, "description": "Region-specific plans for USA, Europe, and Asia.", "features": "Pre-existing Disease;Double Sum Insured;Adventure Sports"},
        {"category": "Travel", "provider": "ICICI Lombard", "policy_name": "Voyager", "premium": 1600, "cover_amount": 3500000, "description": "Single and Multi-trip options available.", "features": "Home Burglary;Total Loss of Baggage;Personal Liability"},
        {"category": "Finance", "provider": "LIC", "policy_name": "New Jeevan Anand", "premium": 24000, "cover_amount": 2000000, "description": "Endowment plan with bonus facility.", "features": "Death Benefit;Maturity Benefit;Participation in Profits"},
        {"category": "Finance", "provider": "HDFC Life", "policy_name": "Sanchay Plus", "premium": 50000, "cover_amount": 1500000, "description": "Guaranteed income for a fixed period.", "features": "Guaranteed Income;Long Term Income;Life Long Income"},
        {"category": "Finance", "provider": "SBI Life", "policy_name": "Smart Platina Assure", "premium": 60000, "cover_amount": 1800000, "description": "Guaranteed returns with limited premium payment.", "features": "Guaranteed Additions;Monthly Payout;Tax Benefits"},
        {"category": "Finance", "provider": "ICICI Pru", "policy_name": "GIFT Pro", "premium": 45000, "cover_amount": 1200000, "description": "Flexible income plan with lump sum benefits.", "features": "MoneyBack Benefit;Level Income;Increasing Income"},
        {"category": "Finance", "provider": "Bajaj Allianz", "policy_name": "Guaranteed Income Goal", "premium": 48000, "cover_amount": 1400000, "description": "Lock in your returns at the time of purchase.", "features": "Lump Sum Benefit;Extended Life Cover;Goal Assure"},
        {"category": "Finance", "provider": "Tata AIA", "policy_name": "Fortune Guarantee", "premium": 55000, "cover_amount": 1600000, "description": "Savings plan with life cover.", "features": "Higher Surrender Value;Loan Availability;Critical Illness"},
        {"category": "Finance", "provider": "Max Life", "policy_name": "Smart Wealth Plan", "premium": 40000, "cover_amount": 1000000, "description": "Wealth creation with comprehensive protection.", "features": "Early Income;Wealth Variant;Policy Continuance"},
        {"category": "Finance", "provider": "Kotak Life", "policy_name": "Guaranteed Savings", "premium": 35000, "cover_amount": 900000, "description": "Affordable savings plan for short term goals.", "features": "Guaranteed Additions;Service Guarantee;Loan Facility"},
        {"category": "Finance", "provider": "PNB MetLife", "policy_name": "Guaranteed Future", "premium": 42000, "cover_amount": 1100000, "description": "Secure your future with guaranteed benefits.", "features": "Income + Lumpsum;Booster Additions;Waiver of Premium"},
        {"category": "Finance", "provider": "Canara HSBC", "policy_name": "Guaranteed Income4Life", "premium": 47000, "cover_amount": 1300000, "description": "Regular income to meet recurring expenses.", "features": "Premium Protection;Deferment Option;Loyalty Additions"}
    ]

    for p in policies:
        db_policy = models.Policy(**p)
        db.add(db_policy)
    
    db.commit()
    print(f"✅ Successfully added {len(policies)} policies!")
    db.close()

if __name__ == "__main__":
    seed_data()