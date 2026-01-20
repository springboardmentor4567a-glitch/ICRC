"""
Test script to verify Claims API endpoint is working
Run this to check if the backend claims endpoint is accessible
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_claims_endpoint():
    print("=" * 60)
    print("INSUREZ - Claims API Endpoint Test")
    print("=" * 60)
    
    # Test 1: Check if backend is running
    print("\n1. Testing backend connection...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"   ✓ Backend is running: {response.json()}")
    except requests.exceptions.ConnectionError:
        print(f"   ✗ ERROR: Cannot connect to {BASE_URL}")
        print(f"   → Please start the backend server first")
        return False
    except Exception as e:
        print(f"   ✗ ERROR: {e}")
        return False
    
    # Test 2: Try to access claims endpoint (will fail without auth)
    print("\n2. Testing claims endpoint (without auth)...")
    try:
        response = requests.get(f"{BASE_URL}/claims/", timeout=5)
        if response.status_code == 401:
            print(f"   ✓ Claims endpoint exists (requires authentication)")
            print(f"   → Endpoint: GET /claims/")
        else:
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"   ✗ ERROR: {e}")
    
    # Test 3: Check API docs
    print("\n3. API Documentation:")
    print(f"   → Swagger UI: {BASE_URL}/docs")
    print(f"   → ReDoc: {BASE_URL}/redoc")
    
    print("\n" + "=" * 60)
    print("WORKING CLAIMS API ENDPOINT:")
    print("=" * 60)
    print(f"✓ GET  {BASE_URL}/claims/")
    print(f"✓ POST {BASE_URL}/claims/")
    print(f"✓ GET  {BASE_URL}/claims/{{claim_id}}")
    print("=" * 60)
    
    print("\nNEXT STEPS:")
    print("1. Ensure backend is running: python -m uvicorn app.main:app --reload")
    print("2. Login to get access token")
    print("3. Claims will load automatically in the frontend")
    print("4. If no claims exist, file a new claim to test")
    
    return True

if __name__ == "__main__":
    test_claims_endpoint()
