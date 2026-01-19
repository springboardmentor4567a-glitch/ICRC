"""
Test script to verify S3 service and file upload functionality
Run this from the backend directory
"""
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.s3_service import s3_service
from io import BytesIO

def test_file_upload():
    """Test file upload functionality"""
    print("=" * 60)
    print("Testing S3 Service / File Upload")
    print("=" * 60)
    
    # Create a test file
    test_content = b"This is a test document for insurance claim CLM001"
    test_file = BytesIO(test_content)
    
    # Test upload
    print("\n1. Testing file upload...")
    result = s3_service.upload_file(
        test_file,
        "test_document.pdf",
        "CLM20260106TEST001"
    )
    
    if result.get("success"):
        print("✅ File upload successful!")
        print(f"   File Key: {result['file_key']}")
        print(f"   File URL: {result['file_url']}")
        print(f"   Original Name: {result['original_filename']}")
    else:
        print("❌ File upload failed!")
        print(f"   Error: {result.get('error')}")
        return False
    
    # Test URL generation
    print("\n2. Testing presigned URL generation...")
    file_key = result['file_key']
    url = s3_service.get_file_url(file_key, expiration=3600)
    
    if url:
        print("✅ URL generation successful!")
        print(f"   URL: {url}")
    else:
        print("❌ URL generation failed!")
    
    # Check if file exists locally (for local storage mode)
    if s3_service.s3_client is None:
        local_path = os.path.join(s3_service.local_storage_path, file_key)
        if os.path.exists(local_path):
            print("\n3. Verifying local file storage...")
            print(f"✅ File exists at: {local_path}")
            with open(local_path, 'rb') as f:
                content = f.read()
                if content == test_content:
                    print("✅ File content verified!")
                else:
                    print("❌ File content mismatch!")
        else:
            print(f"❌ File not found at: {local_path}")
    
    print("\n" + "=" * 60)
    print("Test completed successfully! ✅")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        test_file_upload()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
