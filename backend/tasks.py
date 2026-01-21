from celery_worker import celery
from flask_mail import Message
from app import mail
from models import Claim

@celery.task
def send_claim_email(claim_id):
    claim = Claim.query.get(claim_id)
    msg = Message(
        subject="Claim Submitted",
        recipients=["user@gmail.com"],
        body=f"Your claim ID {claim.id} is submitted."
    )
    mail.send(msg)
