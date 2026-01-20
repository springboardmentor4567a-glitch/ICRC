from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# 1. Test Public Endpoint
def test_read_main():
    # FastAPI usually returns 404 on root if not defined.
    # Test policies endpoint which is public
    response = client.get("/policies")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# 2. Test User Registration Flow
def test_register_user():
    # Use a random email to avoid collision
    import random

    rand_id = random.randint(1000, 9999)
    email = f"testuser{rand_id}@example.com"

    # 1. Send OTP (Simulated)
    response = client.post("/auth/send-otp", json={"email": email})
    assert response.status_code == 200

    # 2. We can't easily get the OTP in a test environment without mocking.
    # So for the capstone, we test failure case with a wrong OTP:
    payload = {
        "email": email,
        "name": "Test User",
        "password": "Password@123",
        "otp": "000000",  # Wrong OTP
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400  # Should fail due to wrong OTP


# 3. Test Admin Protection
def test_admin_access_denied():
    # Try to access admin stats without a token
    response = client.get("/admin/dashboard-stats")
    assert response.status_code == 401  # Unauthorized

