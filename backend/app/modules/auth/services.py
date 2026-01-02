from app.extensions import db
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
import os

class AuthService:
    @staticmethod
    def register_user(data):
        if User.query.filter_by(email=data['email']).first():
            raise ValueError("Email already exists")
        
        # Admin Logic
        is_admin = data['email'].endswith('@icrc.com') or \
                   data['email'] in os.getenv('ADMIN_EMAILS', '').split(',')

        user = User(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password']),
            is_admin=is_admin
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def login_user(data):
        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password, data['password']):
            raise ValueError("Invalid credentials")
        if user.is_banned:
            raise ValueError("Account is banned")

        return {
            "access_token": create_access_token(identity=str(user.id)),
            "refresh_token": create_refresh_token(identity=str(user.id)),
            "user": {
                "id": user.id, 
                "name": user.name, 
                "email": user.email, 
                "is_admin": user.is_admin,
                "risk_profile": user.risk_profile
            }
        }

    # ✅ NEW METHOD: Used by /me endpoint
    @staticmethod
    def get_current_user(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_admin": user.is_admin,
            "risk_profile": user.risk_profile or {}
        }