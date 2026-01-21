from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="yourmail@gmail.com",
    MAIL_PASSWORD="yourpassword",
    MAIL_FROM="yourmail@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False
)

async def send_status_email(email, status, claim_no):

    message = MessageSchema(
        subject="Claim Status Update",
        recipients=[email],
        body=f"""
        Your claim {claim_no} status updated to: {status}
        Please login to check details.
        """,
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
