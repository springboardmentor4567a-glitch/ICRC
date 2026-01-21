from celery_app import celery_app
from fastapi_mail import FastMail, MessageSchema
from config.email import conf

@celery_app.task
def send_claim_email(to_email, claim_id, status):
    message = MessageSchema(
        subject="Claim Status Update",
        recipients=[to_email],
        body=f"""
Hello,

Your claim with ID {claim_id} is currently: {status}

Thank you,
Insurance Team
""",
        subtype="plain"
    )

    fm = FastMail(conf)
    fm.send_message(message)
