import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
from flask import current_app

def _send_async_email(app, to_email, subject, html_body):
    """Sends email in background thread"""
    with app.app_context():
        try:
            # Load Config
            smtp_server = current_app.config.get('MAIL_SERVER')
            smtp_port = current_app.config.get('MAIL_PORT')
            sender_email = current_app.config.get('MAIL_USERNAME')
            sender_password = current_app.config.get('MAIL_PASSWORD')
            
            if not sender_email or not sender_password:
                print("⚠️ Email Config Missing (MAIL_USERNAME/PASSWORD). Skipping.")
                return

            msg = MIMEMultipart('alternative')
            msg['From'] = f"InsureZ <{sender_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(html_body, 'html'))

            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
            server.quit()
            print(f"✅ Email sent to {to_email}")
        except Exception as e:
            print(f"❌ Email Failed: {str(e)}")

def send_notification_email(to_email, user_name, type, details):
    """
    Generate beautiful HTML emails.
    Types: 'policy_purchased', 'policy_cancelled', 'claim_approved', 'claim_rejected'
    """
    
    # Colors
    brand = "#4f46e5"
    bg = "#f8fafc"
    
    # Defaults
    hero_icon = "🛡️"
    hero_title = "Notification"
    status_color = brand
    content_html = ""

    # 1. PURCHASE
    if type == 'policy_purchased':
        hero_icon = "🎉"
        hero_title = "Welcome to InsureZ!"
        content_html = f"""
            <h2 style="color: #1e293b; margin-top:0;">Policy Issued Successfully</h2>
            <p>Hi {user_name}, your policy is now active.</p>
            <div style="background:#eff6ff; border-left:4px solid {brand}; padding:15px; margin:20px 0; border-radius:8px;">
                <strong>Policy:</strong> {details.get('policy_title')}<br>
                <strong>Number:</strong> {details.get('policy_number')}<br>
                <strong>Premium:</strong> ₹{details.get('premium')}<br>
                <strong>Valid Until:</strong> {details.get('end_date')}
            </div>
        """

    # 2. CANCEL
    elif type == 'policy_cancelled':
        hero_icon = "⚠️"
        hero_title = "Policy Cancellation"
        status_color = "#ef4444"
        content_html = f"""
            <h2 style="color: #ef4444; margin-top:0;">Policy Cancelled</h2>
            <p>Hi {user_name}, your policy <strong>{details.get('policy_title')}</strong> has been cancelled.</p>
            <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:15px; margin:20px 0; border-radius:8px;">
                <strong>Refund Status:</strong> {details.get('refund_status')}
            </div>
        """

    # 3. APPROVED
    elif type == 'claim_approved':
        hero_icon = "✅"
        hero_title = "Claim Approved"
        status_color = "#10b981"
        content_html = f"""
            <h2 style="color: #10b981; margin-top:0;">Claim Approved</h2>
            <p>Your claim request has been verified and approved.</p>
            <div style="background:#f0fdf4; border-left:4px solid #10b981; padding:15px; margin:20px 0; border-radius:8px;">
                <strong>Claim ID:</strong> #{details.get('claim_number')}<br>
                <strong>Amount:</strong> ₹{details.get('amount')}
            </div>
            <p>Funds will be transferred shortly.</p>
        """

    # 4. REJECTED
    elif type == 'claim_rejected':
        hero_icon = "❌"
        hero_title = "Claim Status"
        status_color = "#ef4444"
        content_html = f"""
            <h2 style="color: #ef4444; margin-top:0;">Claim Rejected</h2>
            <p>We could not approve your claim at this time.</p>
            <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:15px; margin:20px 0; border-radius:8px;">
                <strong>Reason:</strong> {details.get('reason')}
            </div>
            <p>You can re-file with updated documents.</p>
        """

    # Wrapper
    final_html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: {bg}; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: {status_color}; padding: 30px; text-align: center; color: white;">
                <div style="font-size: 40px;">{hero_icon}</div>
                <h1 style="margin: 10px 0 0; font-size: 24px;">{hero_title}</h1>
            </div>
            <div style="padding: 40px; color: #334155; line-height: 1.6;">
                {content_html}
                <div style="margin-top: 30px; text-align: center;">
                    <a href="http://localhost:3000/dashboard" style="background:{brand}; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">Go to Dashboard</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    # Threading
    from flask import current_app
    app = current_app._get_current_object()
    threading.Thread(target=_send_async_email, args=(app, to_email, hero_title, final_html)).start()