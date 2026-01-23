from flask_mail import Message
from email_config import mail
from email_templates import claim_status_template

def send_claim_email(user_email, claim_no, status):
    html_body = claim_status_template(claim_no, status)

    msg = Message(
        subject="Claim Status Update",
        recipients=[user_email],
        html=html_body
    )

    mail.send(msg)

