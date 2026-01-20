"""
Test script to diagnose File Claim submission error
This will help identify the exact validation error
"""

import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"

# Test data matching frontend format
test_claim = {
    "policy_id": 1,
    "claim_type": "Health",
    "incident_date": str(date.today()),
    "location": "Mumbai, Maharashtra",
    "amount_requested": 50000.0,
    "description": "Test claim submission"
}

print("=" * 70)
print("FILE CLAIM SUBMISSION - DIAGNOSTIC TEST")
print("=" * 70)

# First, check if backend is running
print("\n1. Checking backend connection...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"   ✓ Backend is running: {response.json()}")
except Exception as e:
    print(f"   ✗ ERROR: Cannot connect to backend - {e}")
    exit(1)

# Test claims endpoint without auth (should get 401)
print("\n2. Testing claims endpoint (without auth)...")
try:
    response = requests.post(f"{BASE_URL}/claims/", json=test_claim)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Check API docs
print("\n3. API Documentation:")
print(f"   → Swagger UI: {BASE_URL}/docs")
print(f"   → Test the POST /claims/ endpoint there with authentication")

print("\n" + "=" * 70)
print("NEXT STEPS:")
print("=" * 70)
print("1. Login to get access token")
print("2. Use token to test POST /claims/ in Swagger UI")
print("3. Check exact validation error message")
print("4. Verify all fields match ClaimCreate schema")
print("\nExpected ClaimCreate schema:")
print(json.dumps({
    "policy_id": "int",
    "claim_type": "str",
    "incident_date": "date (YYYY-MM-DD)",
    "location": "str",
    "amount_requested": "float",
    "description": "str"
}, indent=2))
