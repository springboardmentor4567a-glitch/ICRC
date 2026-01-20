"""
Script to clean duplicate policies and seed unique ICR policies.
This script truncates the policies table and inserts 18 unique policies.
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
        # Step 1: Clean existing policies (truncate approach)
        print("🧹 Cleaning existing policies table...")
        db.query(Policy).delete()
        db.commit()
        print("✅ All existing policies removed")
        
        # Step 2: Insert 18 unique ICR policies
        unique_policies = [
            # Health Insurance (6 policies)
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
                "name": "ICR Micro Health Protect",
                "provider": "ICR Health",
                "type": "Health",
                "coverage_amount": 200000,
                "premium": 6000,
                "duration_months": 12
            },
            {
                "name": "ICR Critical Care Shield",
                "provider": "ICR Health",
                "type": "Health",
                "coverage_amount": 1500000,
                "premium": 25000,
                "duration_months": 12
            },
            {
                "name": "ICR Women Wellness Guard",
                "provider": "ICR Health",
                "type": "Health",
                "coverage_amount": 800000,
                "premium": 16000,
                "duration_months": 12
            },
            
            # Life Insurance (6 policies)
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
                "name": "ICR Retirement Income Plan",
                "provider": "ICR Life",
                "type": "Life",
                "coverage_amount": 3000000,
                "premium": 24000,
                "duration_months": 300  # 25 years
            },
            {
                "name": "ICR Rural Family Shield",
                "provider": "ICR Life",
                "type": "Life",
                "coverage_amount": 1200000,
                "premium": 8500,
                "duration_months": 180  # 15 years
            },
            
            # Motor Insurance (3 policies)
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
                "name": "ICR Electric Vehicle Protect",
                "provider": "ICR General",
                "type": "Motor",
                "coverage_amount": 600000,
                "premium": 9500,
                "duration_months": 12
            },
            
            # Other Insurance Types (3 policies)
            {
                "name": "ICR Global Travel Protect",
                "provider": "ICR General",
                "type": "Travel",
                "coverage_amount": 200000,
                "premium": 5000,
                "duration_months": 12
            },
            {
                "name": "ICR Home Secure Plus",
                "provider": "ICR General",
                "type": "Home",
                "coverage_amount": 2500000,
                "premium": 18000,
                "duration_months": 12
            },
            {
                "name": "ICR Cyber Safe Shield",
                "provider": "ICR General",
                "type": "Cyber",
                "coverage_amount": 1000000,
                "premium": 12000,
                "duration_months": 12
            }
        ]
        
        print(f"🌱 Inserting {len(unique_policies)} unique policies...")
        for policy_data in unique_policies:
            policy = Policy(**policy_data)
            db.add(policy)
        
        db.commit()
        
        # Step 3: Verify results
        all_policies = db.query(Policy).all()
        print(f"✅ Successfully seeded {len(all_policies)} unique policies!")
        
        # Group by type for display
        by_type = {}
        for policy in all_policies:
            if policy.type not in by_type:
                by_type[policy.type] = []
            by_type[policy.type].append(policy)
        
        print("\n📋 Unique policies by type:")
        for policy_type, policies in by_type.items():
            print(f"\n  {policy_type} ({len(policies)} policies):")
            for policy in policies:
                print(f"    - {policy.name} | {policy.provider} | ₹{policy.coverage_amount:,} | ₹{policy.premium:,}/yr")
        
        # Step 4: Check for duplicates
        print("\n🔍 Checking for duplicates...")
        duplicates = db.execute("""
            SELECT name, type, provider, COUNT(*) as count
            FROM policies 
            GROUP BY name, type, provider 
            HAVING COUNT(*) > 1
        """).fetchall()
        
        if duplicates:
            print(f"❌ Found {len(duplicates)} duplicate combinations!")
            for dup in duplicates:
                print(f"  - {dup.name} | {dup.type} | {dup.provider} (count: {dup.count})")
        else:
            print("✅ No duplicates found - all policies are unique!")
            
    except Exception as e:
        print(f"❌ Error cleaning/seeding policies: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🧹 Cleaning duplicate policies and seeding unique ICR policies...")
    clean_and_seed_unique_policies()