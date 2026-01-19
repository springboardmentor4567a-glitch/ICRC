# backend/app/tasks.py
from .celery_app import celery_app
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)

# For development without email server
USE_EMAIL = os.getenv("USE_EMAIL", "false").lower() == "true"


@celery_app.task(name='tasks.send_claim_notification')
def send_claim_notification(to_email: str, claim_number: str, status: str, notes: str = ""):
    """
    Send email notification about claim status update
    """
    if not USE_EMAIL or not SMTP_USER:
        # Log instead of sending email in development
        logger.info(f"[EMAIL] To: {to_email} | Claim: {claim_number} | Status: {status}")
        logger.info(f"[EMAIL] Notes: {notes}")
        return {"success": True, "message": "Email logged (email disabled)"}
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Claim Status Update - {claim_number}'
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        
        # Email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Claim Status Update</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <p style="font-size: 16px;">Dear Customer,</p>
                    <p style="font-size: 16px;">Your insurance claim has been updated:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Claim Number:</strong> {claim_number}</p>
                        <p style="margin: 10px 0;"><strong>New Status:</strong> 
                            <span style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px;">
                                {status}
                            </span>
                        </p>
                        {f'<p style="margin: 10px 0;"><strong>Notes:</strong> {notes}</p>' if notes else ''}
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">
                        You can track your claim status anytime by logging into your account.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:5173/track-claims" 
                           style="background: #667eea; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Track Your Claims
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p>© 2026 Insurance ASIS Application. All rights reserved.</p>
                    <p>This is an automated notification. Please do not reply to this email.</p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Claim Status Update
        
        Dear Customer,
        
        Your insurance claim has been updated:
        
        Claim Number: {claim_number}
        New Status: {status}
        {f'Notes: {notes}' if notes else ''}
        
        You can track your claim status anytime by logging into your account at:
        http://localhost:5173/track-claims
        
        © 2026 Insurance ASIS Application. All rights reserved.
        """
        
        # Attach both HTML and plain text versions
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email} for claim {claim_number}")
        return {"success": True, "message": "Email sent successfully"}
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task(name='tasks.send_welcome_email')
def send_welcome_email(to_email: str, username: str):
    """
    Send welcome email to new users
    """
    if not USE_EMAIL or not SMTP_USER:
        logger.info(f"[EMAIL] Welcome email to: {to_email} | User: {username}")
        return {"success": True, "message": "Email logged (email disabled)"}
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Welcome to Insurance ASIS Application'
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to Insurance ASIS!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <p style="font-size: 16px;">Hello {username},</p>
                    <p style="font-size: 16px;">Welcome to Insurance ASIS Application! Your account has been successfully created.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>What you can do:</h3>
                        <ul style="line-height: 1.8;">
                            <li>Compare insurance policies</li>
                            <li>Calculate premium costs</li>
                            <li>File and track claims</li>
                            <li>Get personalized recommendations</li>
                            <li>Chat with our AI assistant</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:5173/login" 
                           style="background: #667eea; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Login to Your Account
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p>© 2026 Insurance ASIS Application. All rights reserved.</p>
                </div>
            </body>
        </html>
        """
        
        part = MIMEText(html_body, 'html')
        msg.attach(part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Welcome email sent to {to_email}")
        return {"success": True, "message": "Welcome email sent"}
        
    except Exception as e:
        logger.error(f"Error sending welcome email: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task(name='tasks.send_policy_update_email')
def send_policy_update_email(to_email: str, policy_name: str, update_type: str, details: str = ""):
    """
    Send email notification about policy updates (renewal, price change, coverage change, etc.)
    """
    if not USE_EMAIL or not SMTP_USER:
        logger.info(f"[EMAIL] Policy Update | To: {to_email} | Policy: {policy_name} | Type: {update_type}")
        logger.info(f"[EMAIL] Details: {details}")
        return {"success": True, "message": "Email logged (email disabled)"}
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Policy Update - {policy_name}'
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        
        # Color coding based on update type
        status_colors = {
            "Renewal": "#2196F3",
            "Price Change": "#FF9800",
            "Coverage Update": "#4CAF50",
            "Expiration Notice": "#F44336"
        }
        status_color = status_colors.get(update_type, "#2196F3")
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Policy Update</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <p style="font-size: 16px;">Dear Customer,</p>
                    <p style="font-size: 16px;">We have an important update regarding your insurance policy:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Policy Name:</strong> {policy_name}</p>
                        <p style="margin: 10px 0;"><strong>Update Type:</strong> 
                            <span style="background: {status_color}; color: white; padding: 5px 15px; border-radius: 20px;">
                                {update_type}
                            </span>
                        </p>
                        {f'<p style="margin: 10px 0;"><strong>Details:</strong><br>{details}</p>' if details else ''}
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">
                        Please review your policy details and take any necessary action.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:5173/dashboard" 
                           style="background: #667eea; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Your Policies
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p>© 2026 Insurance ASIS Application. All rights reserved.</p>
                    <p>This is an automated notification. Please do not reply to this email.</p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Policy Update
        
        Dear Customer,
        
        We have an important update regarding your insurance policy:
        
        Policy Name: {policy_name}
        Update Type: {update_type}
        {f'Details: {details}' if details else ''}
        
        Please review your policy details and take any necessary action.
        
        View your policies: http://localhost:5173/dashboard
        
        © 2026 Insurance ASIS Application. All rights reserved.
        """
        
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Policy update email sent to {to_email} for policy {policy_name}")
        return {"success": True, "message": "Email sent successfully"}
        
    except Exception as e:
        logger.error(f"Error sending policy update email: {e}")
        return {"success": False, "error": str(e)}


@celery_app.task(name='tasks.send_bulk_policy_notification')
def send_bulk_policy_notification(user_emails: list, policy_name: str, update_type: str, details: str = ""):
    """
    Send bulk policy notifications to multiple users
    """
    if not USE_EMAIL or not SMTP_USER:
        logger.info(f"[EMAIL] Bulk notification to {len(user_emails)} users")
        return {"success": True, "message": f"Bulk emails logged ({len(user_emails)} recipients)"}
    
    failed_emails = []
    
    for email in user_emails:
        try:
            send_policy_update_email(email, policy_name, update_type, details)
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")
            failed_emails.append(email)
    
    return {
        "success": len(failed_emails) == 0,
        "total": len(user_emails),
        "failed": len(failed_emails),
        "failed_emails": failed_emails if failed_emails else None
    }
