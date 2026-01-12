import smtplib
from email.message import EmailMessage

EMAIL_ADDRESS = "srivallipulaparthi24@gmail.com"
EMAIL_PASSWORD = "palbpttvoggvdiax"


def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)
