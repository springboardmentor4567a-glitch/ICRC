import os
from datetime import timedelta

class Config:
    # Security Keys
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-this'
    
    # ✅ Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:Dinesh%40099@localhost:5432/insurez_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # 📧 EMAIL CONFIGURATION (Add this)
    # Use Environment Variables in production!
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = True
    # For Gmail, generate an "App Password" from your Google Account > Security
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'velagadinesh099@gmail.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'volz brtc jqra rtoq'
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'InsureZ Support <noreply@insurez.com>'