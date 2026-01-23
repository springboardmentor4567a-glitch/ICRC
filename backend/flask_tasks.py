from celery_worker import celery
from flask_mail import Message
from app import mail, app
from models import Claim, UserPolicy, User

@celery.task
def send_claim_email(claim_id):
    with app.app_context():
        claim = Claim.query.get(claim_id)
        if not claim:
            return

        # Get user email from the claim's user policy
        user = claim.user_policy.user
        if not user or not user.email:
            return

        # Create email content based on status
        status_messages = {
            "approved": "Your claim has been approved and payment will be processed shortly.",
            "rejected": "Your claim has been reviewed and unfortunately rejected.",
            "processing": "Your claim is being processed for payment.",
            "under review": "Your claim is being reviewed by our claims team.",
            "submitted": "Your claim has been submitted successfully."
        }

        status_message = status_messages.get(claim.status, f"Your claim status has been updated to {claim.status}.")

        msg = Message(
            subject=f"Claim Status Update - {claim.claim_number}",
            recipients=[user.email],
            html=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; text-align: center;">Claim Status Update</h2>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #28a745; margin-top: 0;">Claim #{claim.claim_number}</h3>

                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 150px;">Claim Type:</td>
                            <td style="padding: 8px 0;">{claim.claim_type}</td>
                        </tr>
                        <tr style="background-color: #fff;">
                            <td style="padding: 8px 0; font-weight: bold;">Amount Claimed:</td>
                            <td style="padding: 8px 0;">₹{claim.amount_claimed}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Current Status:</td>
                            <td style="padding: 8px 0; color: #007bff; font-weight: bold;">{claim.status.capitalize()}</td>
                        </tr>
                        <tr style="background-color: #fff;">
                            <td style="padding: 8px 0; font-weight: bold;">Updated Date:</td>
                            <td style="padding: 8px 0;">{claim.updated_at.strftime('%Y-%m-%d %H:%M:%S') if claim.updated_at else 'N/A'}</td>
                        </tr>
                    </table>

                    <p style="margin-top: 20px;"><strong>Update:</strong> {status_message}</p>
                </div>

                <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #495057;">What happens next?</h4>
                    <ul style="color: #6c757d; margin: 10px 0;">
                        <li>You can track your claim status in your dashboard</li>
                        <li>For approved claims, payment will be processed within 3-5 business days</li>
                        <li>If you have questions, please contact our support team</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Claim Details</a>
                </div>

                <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 12px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>If you have any questions, please contact our support team.</p>
                    <p>&copy; 2024 Insurance Company. All rights reserved.</p>
                </div>
            </div>
            """
        )
        mail.send(msg)
        print(f"Claim status update email sent to {user.email} for claim {claim.claim_number}")
