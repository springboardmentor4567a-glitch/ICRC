#!/usr/bin/env python3
"""
INSUREZ Claims API Test Script
Run this to verify the claims endpoints are working properly
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"

def test_claims_api():
    print("🧪 INSUREZ Claims API Test")
    print("=" * 50)
    
    # Step 1: Login to get token
    print("1. Testing login...")
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("✅ Login successful")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print("Create a test user first or update TEST_EMAIL/TEST_PASSWORD")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Test GET /claims/ endpoint
    print("\n2. Testing GET /claims/ endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/claims/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            claims = response.json()
            print(f"✅ Claims loaded: {len(claims)}")
            if claims:
                print("Sample claim:", json.dumps(claims[0], indent=2, default=str))
            else:
                print("No claims found - this is normal for new users")
        else:
            print(f"❌ Claims API failed: {response.text}")
    except Exception as e:
        print(f"❌ Claims API error: {e}")
    
    # Step 3: Test POST /claims/ endpoint (create claim)
    print("\n3. Testing POST /claims/ endpoint...")
    test_claim = {
        "policy_id": 1,  # Adjust based on your policies
        "claim_type": "Health",
        "incident_date": "2024-01-15",
        "location": "Test City, India",
        "amount_requested": 25000.00,
        "description": "Test claim for API verification"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/claims/", json=test_claim, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            new_claim = response.json()
            print(f"✅ Claim created: #{new_claim['claim_id']}")
            print("New claim:", json.dumps(new_claim, indent=2, default=str))
        else:
            print(f"❌ Create claim failed: {response.text}")
    except Exception as e:
        print(f"❌ Create claim error: {e}")
    
    # Step 4: Test GET /claims/ again to see the new claim
    print("\n4. Testing claims list after creation...")
    try:
        response = requests.get(f"{BASE_URL}/claims/", headers=headers)
        if response.status_code == 200:
            claims = response.json()
            print(f"✅ Total claims now: {len(claims)}")
        else:
            print(f"❌ Claims refresh failed: {response.text}")
    except Exception as e:
        print(f"❌ Claims refresh error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test Complete!")
    print("\nNext steps:")
    print("1. Run the backend: uvicorn app.main:app --reload")
    print("2. Run the frontend: npm run dev")
    print("3. Test Claims Status Tracking page")
    print("4. File a new claim and verify it appears")

if __name__ == "__main__":
    test_claims_api()