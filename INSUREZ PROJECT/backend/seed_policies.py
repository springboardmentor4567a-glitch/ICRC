"""
Script to seed realistic insurance policies into the database.
Run this script to populate the policies table with sample data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.policy import Policy
from datetime import datetime, timedelta
import random

def seed_policies():
    db = SessionLocal()
    
    try:
        # Clear existing policies (optional - remove this if you want to keep existing data)
        # db.query(Policy).delete()
        
        # Sample policies with realistic data
        sample_policies = [
            {
                "name": "Comprehensive Health Shield",
                "provider": "Star Health Insurance",
                "type": "Health",
                "coverage_amount": 500000,
                "premium": 12000,
                "duration_months": 12
            },
            {
                "name": "Family Floater Plus",
                "provider": "HDFC ERGO",
                "type": "Health",
                "coverage_amount": 1000000,
                "premium": 18500,
                "duration_months": 12
            },
            {
                "name": "Term Life Secure",
                "provider": "LIC of India",
                "type": "Life",
                "coverage_amount": 2500000,
                "premium": 15000,
                "duration_months": 240
            },
            {
                "name": "Motor Complete Protection",
                "provider": "Bajaj Allianz",
                "type": "Motor",
                "coverage_amount": 800000,
                "premium": 8500,
                "duration_months": 12
            },
            {
                "name": "Critical Illness Cover",
                "provider": "Max Bupa",
                "type": "Health",
                "coverage_amount": 750000,
                "premium": 22000,
                "duration_months": 12
            },
            {
                "name": "Two Wheeler Insurance",
                "provider": "ICICI Lombard",
                "type": "Motor",
                "coverage_amount": 150000,
                "premium": 3500,
                "duration_months": 12
            },
            {
                "name": "Whole Life Premium",
                "provider": "SBI Life",
                "type": "Life",
                "coverage_amount": 5000000,
                "premium": 45000,
                "duration_months": 300
            },
            {
                "name": "Senior Citizen Health",
                "provider": "Oriental Insurance",
                "type": "Health",
                "coverage_amount": 300000,
                "premium": 16000,
                "duration_months": 12
            }
        ]
        
        # Add policies to database
        for policy_data in sample_policies:
            # Check if policy already exists
            existing = db.query(Policy).filter(Policy.name == policy_data["name"]).first()
            if not existing:
                policy = Policy(**policy_data)
                db.add(policy)
        
        db.commit()
        print(f"✅ Successfully seeded {len(sample_policies)} policies!")
        
        # Display current policies
        all_policies = db.query(Policy).all()
        print(f"\n📋 Total policies in database: {len(all_policies)}")
        for policy in all_policies:
            print(f"  - {policy.name} ({policy.type}) - {policy.provider}")
            
    except Exception as e:
        print(f"❌ Error seeding policies: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding policy data...")
    seed_policies()