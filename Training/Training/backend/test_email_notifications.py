"""
Email Notification Test Script
Run this after configuring your .env file to test email sending
"""

import os
import sys
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from app.tasks import send_claim_notification, send_policy_update_email

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def test_email_configuration():
    """Test if email configuration is valid"""
    print_header("Testing Email Configuration")
    
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = os.getenv("SMTP_PORT", "")
    smtp_user = os.getenv("SMTP_USER", "")
    use_email = os.getenv("USE_EMAIL", "false").lower() == "true"
    
    print(f"SMTP Host: {smtp_host}")
    print(f"SMTP Port: {smtp_port}")
    print(f"SMTP User: {smtp_user}")
    print(f"Email Enabled: {use_email}")
    
    if not use_email:
        print("\n⚠️  WARNING: USE_EMAIL is set to False!")
        print("   Emails will be logged instead of sent.")
        print("   Set USE_EMAIL=true in .env to enable email sending.")
    
    if not smtp_user:
        print("\n❌ ERROR: SMTP_USER not configured!")
        print("   Please add your email to .env file.")
        return False
    
    print("\n✓ Configuration looks valid")
    return True

def test_claim_notification(test_email: str):
    """Test claim notification email"""
    print_header("Testing Claim Notification Email")
    
    print(f"Sending test email to: {test_email}")
    print("Claim Number: CLM20260114TEST001")
    print("Status: Approved")
    print("Notes: This is a test notification\n")
    
    try:
        result = send_claim_notification(
            to_email=test_email,
            claim_number="CLM20260114TEST001",
            status="Approved",
            notes="This is a test claim notification email."
        )
        
        if result.get("success"):
            print("✓ Email sent successfully!")
            print(f"Message: {result.get('message')}")
            return True
        else:
            print("❌ Email failed to send")
            print(f"Error: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_policy_update(test_email: str):
    """Test policy update email"""
    print_header("Testing Policy Update Email")
    
    print(f"Sending test email to: {test_email}")
    print("Policy: Health Insurance Premium")
    print("Update Type: Renewal")
    print("Details: Your policy will renew on 2026-02-15\n")
    
    try:
        result = send_policy_update_email(
            to_email=test_email,
            policy_name="Health Insurance Premium",
            update_type="Renewal",
            details="Your policy will renew on 2026-02-15. Premium: $500/month"
        )
        
        if result.get("success"):
            print("✓ Email sent successfully!")
            print(f"Message: {result.get('message')}")
            return True
        else:
            print("❌ Email failed to send")
            print(f"Error: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*10 + "Insurance ASIS Email Notification Tester" + " "*8 + "║")
    print("╚" + "="*58 + "╝")
    
    # Test configuration
    if not test_email_configuration():
        print("\n❌ Email configuration is invalid. Please check your .env file.")
        sys.exit(1)
    
    # Get test email from user
    print_header("Enter Test Email Address")
    test_email = input("Enter the email address to send test emails to: ").strip()
    
    if not test_email or "@" not in test_email:
        print("❌ Invalid email address")
        sys.exit(1)
    
    print(f"\n✓ Using test email: {test_email}")
    
    # Run tests
    results = []
    
    print("\nStarting tests in 2 seconds...")
    time.sleep(2)
    
    results.append(("Claim Notification", test_claim_notification(test_email)))
    time.sleep(1)
    
    results.append(("Policy Update", test_policy_update(test_email)))
    
    # Summary
    print_header("Test Summary")
    
    all_passed = all(result[1] for result in results)
    
    for name, passed in results:
        status = "✓ PASSED" if passed else "❌ FAILED"
        print(f"{name}: {status}")
    
    if all_passed:
        print("\n✓ All tests passed! Email notifications are working correctly.")
        print("\nNext steps:")
        print("1. Check your email inbox for the test messages")
        print("2. Start your backend server: python -m uvicorn app.main:app --reload")
        print("3. Start your frontend: npm run dev")
        print("4. Add NotificationPreferences component to your Dashboard")
        print("5. Users can now control their email preferences!")
    else:
        print("\n❌ Some tests failed. Please check your email configuration.")
        print("\nCommon issues:")
        print("- Gmail: Make sure 2FA is enabled and you're using an App Password")
        print("- Check that SMTP_USER and SMTP_PASSWORD are correct")
        print("- Check that USE_EMAIL=true in .env")
        print("- Verify your email provider's SMTP settings")
    
    print("\n")

if __name__ == "__main__":
    main()
