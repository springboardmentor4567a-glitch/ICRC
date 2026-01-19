# backend/app/s3_service.py
import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import uuid

load_dotenv()

logger = logging.getLogger(__name__)

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "insurance-claims-documents")

# For local development, use LocalStack or MinIO if AWS credentials are not available
USE_LOCAL_S3 = os.getenv("USE_LOCAL_S3", "true").lower() == "true"
LOCAL_S3_ENDPOINT = os.getenv("LOCAL_S3_ENDPOINT", "http://localhost:4566")

class S3Service:
    def __init__(self):
        """Initialize S3 client"""
        if USE_LOCAL_S3:
            # For development without AWS credentials
            self.s3_client = None
            self.local_storage_path = os.path.join(os.path.dirname(__file__), "uploads")
            os.makedirs(self.local_storage_path, exist_ok=True)
            logger.info("Using local file storage instead of S3")
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                    region_name=AWS_REGION
                )
                # Ensure bucket exists
                self._ensure_bucket_exists()
                logger.info(f"S3 client initialized for bucket: {S3_BUCKET_NAME}")
            except Exception as e:
                logger.warning(f"Failed to initialize S3 client: {e}. Falling back to local storage.")
                self.s3_client = None
                self.local_storage_path = os.path.join(os.path.dirname(__file__), "uploads")
                os.makedirs(self.local_storage_path, exist_ok=True)

    def _ensure_bucket_exists(self):
        """Create S3 bucket if it doesn't exist"""
        if not self.s3_client:
            return
        
        try:
            self.s3_client.head_bucket(Bucket=S3_BUCKET_NAME)
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                try:
                    if AWS_REGION == 'us-east-1':
                        self.s3_client.create_bucket(Bucket=S3_BUCKET_NAME)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=S3_BUCKET_NAME,
                            CreateBucketConfiguration={'LocationConstraint': AWS_REGION}
                        )
                    logger.info(f"Created S3 bucket: {S3_BUCKET_NAME}")
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket: {create_error}")

    def upload_file(self, file_obj, original_filename: str, claim_number: str) -> dict:
        """
        Upload file to S3 or local storage
        Returns dict with file_url and file_key
        """
        try:
            # Generate unique filename
            file_extension = os.path.splitext(original_filename)[1]
            unique_filename = f"{claim_number}/{uuid.uuid4()}{file_extension}"
            
            if self.s3_client:
                # Upload to S3
                self.s3_client.upload_fileobj(
                    file_obj,
                    S3_BUCKET_NAME,
                    unique_filename,
                    ExtraArgs={
                        'ContentType': self._get_content_type(file_extension),
                        'Metadata': {
                            'original_filename': original_filename,
                            'claim_number': claim_number,
                            'upload_date': datetime.now().isoformat()
                        }
                    }
                )
                
                file_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
                logger.info(f"File uploaded to S3: {unique_filename}")
            else:
                # Save to local storage
                claim_folder = os.path.join(self.local_storage_path, claim_number)
                os.makedirs(claim_folder, exist_ok=True)
                
                local_filename = f"{uuid.uuid4()}{file_extension}"
                local_path = os.path.join(claim_folder, local_filename)
                
                with open(local_path, 'wb') as f:
                    f.write(file_obj.read())
                
                file_url = f"/uploads/{claim_number}/{local_filename}"
                unique_filename = f"{claim_number}/{local_filename}"
                logger.info(f"File saved locally: {local_path}")
            
            return {
                "success": True,
                "file_key": unique_filename,
                "file_url": file_url,
                "original_filename": original_filename
            }
            
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_file_url(self, file_key: str, expiration: int = 3600) -> str:
        """
        Generate presigned URL for file access
        """
        if not self.s3_client:
            # Return local file path
            return f"/uploads/{file_key}"
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': S3_BUCKET_NAME,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return ""

    def delete_file(self, file_key: str) -> bool:
        """Delete file from S3 or local storage"""
        try:
            if self.s3_client:
                self.s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=file_key)
                logger.info(f"File deleted from S3: {file_key}")
            else:
                local_path = os.path.join(self.local_storage_path, file_key)
                if os.path.exists(local_path):
                    os.remove(local_path)
                    logger.info(f"File deleted locally: {local_path}")
            return True
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False

    def _get_content_type(self, file_extension: str) -> str:
        """Get content type based on file extension"""
        content_types = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain'
        }
        return content_types.get(file_extension.lower(), 'application/octet-stream')


# Singleton instance
s3_service = S3Service()
