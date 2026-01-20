"""
Clean script to remove duplicate policies and seed unique ICR policies.
This script truncates the policies table and inserts exactly 10 unique policies.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.policy import Policy

def clean_and_seed_unique_policies():
    db = SessionLocal()
    
    try:
        # Step 1: Remove all existing policies to eliminate duplicates
        print("🧹 Cleaning existing policies...")
        db.query(Policy).delete()
        
        # Step 2: Insert 10 unique ICR policies
        unique_policies = [
            {
                "name": "ICR Health Shield Plus",
                "provider": "ICR Health",
                "type": "Health",
                "coverage_amount": 500000,
                "premium": 12000,
                "duration_months": 12
            },
            {
                "name": "ICR Health Shield Family",
                "provider": "ICR Health", 
                "type": "Health",
                "coverage_amount": 1000000,
                "premium": 18500,
                "duration_months": 12
            },
            {
                "name": "ICR Senior Care Shield",
                "provider": "ICR Health",
                "type": "Health",
                "coverage_amount": 750000,
                "premium": 22000,
                "duration_months": 12
            },
            {
                "name": "ICR Smart Life Secure",
                "provider": "ICR Life",
                "type": "Life",
                "coverage_amount": 2500000,
                "premium": 15000,
                "duration_months": 120  # 10 years
            },
            {
                "name": "ICR Term Protect 1Cr",
                "provider": "ICR Life",
                "type": "Life", 
                "coverage_amount": 10000000,
                "premium": 9999,
                "duration_months": 360  # 30 years
            },
            {
                "name": "ICR Child Education Guard",
                "provider": "ICR Life",
                "type": "Life",
                "coverage_amount": 1500000,
                "premium": 13500,
                "duration_months": 180  # 15 years
            },
            {
                "name": "ICR Income Secure Plan",
                "provider": "ICR Life",
                "type": "Life",
                "coverage_amount": 2000000,
                "premium": 17000,
                "duration_months": 240  # 20 years
            },
            {
                "name": "ICR Motor Protect Plus",
                "provider": "ICR General",
                "type": "Motor",
                "coverage_amount": 500000,
                "premium": 8000,
                "duration_months": 12
            },
            {
                "name": "ICR Motor Zero-Dep",
                "provider": "ICR General",
                "type": "Motor",
                "coverage_amount": 750000,
                "premium": 11500,
                "duration_months": 12
            },
            {
                "name": "ICR Travel Guard",
                "provider": "ICR General",
                "type": "Travel",
                "coverage_amount": 200000,
                "premium": 5000,
                "duration_months": 12
            }
        ]
        
        print("🌱 Inserting unique policies...")
        for policy_data in unique_policies:
            policy = Policy(**policy_data)
            db.add(policy)
        
        db.commit()
        
        # Step 3: Verify results
        all_policies = db.query(Policy).all()
        print(f"✅ Successfully cleaned and seeded unique policies!")
        print(f"📋 Total unique policies in database: {len(all_policies)}")
        print("\nUnique policies:")
        for i, policy in enumerate(all_policies, 1):
            print(f"  {i}. {policy.name} ({policy.type}) - {policy.provider}")
            
    except Exception as e:
        print(f"❌ Error cleaning/seeding policies: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🧹 Cleaning duplicate policies and seeding unique ICR policies...")
    clean_and_seed_unique_policies()