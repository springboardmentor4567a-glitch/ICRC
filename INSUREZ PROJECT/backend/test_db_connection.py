#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, get_db
from app.models.claim import Claim
from app.models.user import User
from app.models.policy import Policy
from sqlalchemy.orm import Session

def test_database_connection():
    """Test if we can connect to the database and query tables"""
    print("Testing database connection...")
    
    try:
        # Test connection
        with engine.connect() as conn:
            print("Database connection successful")
        
        # Test if tables exist
        db = next(get_db())
        
        # Count users
        user_count = db.query(User).count()
        print(f"Users table: {user_count} records")
        
        # Count policies  
        policy_count = db.query(Policy).count()
        print(f"Policies table: {policy_count} records")
        
        # Count claims
        claim_count = db.query(Claim).count()
        print(f"Claims table: {claim_count} records")
        
        db.close()
        
        if policy_count == 0:
            print("WARNING: No policies found - run seed script if needed")
        
        print("\nDatabase is ready for claims!")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()