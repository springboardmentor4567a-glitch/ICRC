from celery import Celery
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery(
    "insurez",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

@celery_app.task
def send_claim_status_email(user_email: str, user_name: str, claim_id: int, status: str, claim_type: str):
    try:
        smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("MAIL_PORT", "587"))
        sender_email = os.getenv("MAIL_FROM")
        sender_password = os.getenv("MAIL_PASSWORD")
        sender_name = os.getenv("MAIL_FROM_NAME", "INSUREZ Support")
        
        if not all([sender_email, sender_password]):
            return False
        
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Claim #{claim_id} Status Update - {status.title()}"
        message["From"] = f"{sender_name} <{sender_email}>"
        message["To"] = user_email
        
        status_messages = {
            "approved": {
                "title": "Great News! Your Claim Has Been Approved",
                "message": "We're pleased to inform you that your claim has been approved and will be processed for payment.",
                "color": "#10B981"
            },
            "rejected": {
                "title": "Claim Update Required",
                "message": "Your claim requires additional review. Please contact our support team for more information.",
                "color": "#EF4444"
            },
            "paid": {
                "title": "Payment Processed Successfully",
                "message": "Your claim payment has been processed and should reflect in your account within 3-5 business days.",
                "color": "#D4AF37"
            },
            "pending": {
                "title": "Claim Received and Under Review",
                "message": "We have received your claim and it is currently under review. We'll update you soon.",
                "color": "#6B7280"
            }
        }
        
        status_info = status_messages.get(status, status_messages["pending"])
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Claim Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: bold;">INSUREZ</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Insurance Comparison & Recommendation</p>
                </div>
                
                <div style="padding: 40px 30px;">
                    <h2 style="color: {status_info['color']}; margin: 0 0 20px 0; font-size: 24px;">{status_info['title']}</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Dear {user_name},
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        {status_info['message']}
                    </p>
                    
                    <div style="background-color: #f8fafc; border-left: 4px solid {status_info['color']}; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #0F172A; margin: 0 0 15px 0; font-size: 18px;">Claim Details</h3>
                        <p style="color: #6B7280; margin: 5px 0; font-size: 14px;"><strong>Claim ID:</strong> #{claim_id}</p>
                        <p style="color: #6B7280; margin: 5px 0; font-size: 14px;"><strong>Claim Type:</strong> {claim_type}</p>
                        <p style="color: #6B7280; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: {status_info['color']}; font-weight: bold;">{status.title()}</span></p>
                    </div>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 30px 0;">
                        You can track your claim status anytime by logging into your INSUREZ dashboard.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="http://localhost:5173/dashboard" style="background-color: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Dashboard</a>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
                        Need help? Contact our support team at support@insurez.com
                    </p>
                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                        © 2024 INSUREZ. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text = f"""
        INSUREZ - Claim Status Update
        
        Dear {user_name},
        
        {status_info['message']}
        
        Claim Details:
        - Claim ID: #{claim_id}
        - Claim Type: {claim_type}
        - Status: {status.title()}
        
        You can track your claim status anytime by logging into your INSUREZ dashboard at:
        http://localhost:5173/dashboard
        
        Need help? Contact our support team at support@insurez.com
        
        © 2024 INSUREZ. All rights reserved.
        """
        
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(message)
        
        return True
        
    except Exception as e:
        return False