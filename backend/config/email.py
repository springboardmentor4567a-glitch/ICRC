from fastapi_mail import ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "yourgmail@gmail.com",
    MAIL_PASSWORD = "your_app_password",
    MAIL_FROM = "yourgmail@gmail.com",
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_PORT = 587,
    MAIL_TLS = True,
    MAIL_SSL = False,
    USE_CREDENTIALS = True
)
