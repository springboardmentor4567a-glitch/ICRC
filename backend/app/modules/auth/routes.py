from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os

# ✅ FIXED IMPORTS
from app.extensions import db
from app.modules.auth.models import User
from app.utils.validators import require_json_fields

auth_bp = Blueprint('auth', __name__)

# --- HELPER: Check Admin Domain ---
def is_admin_email(email):
    if not email: return False
    if email.lower().endswith('@icrc.com'):
        return True
    admin_list = [e.strip().lower() for e in os.getenv('ADMIN_EMAILS', '').split(',') if e.strip()]
    return email.lower() in admin_list

@auth_bp.route('/register', methods=['POST'])
@require_json_fields('name', 'email', 'password')
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400

    is_admin_flag = is_admin_email(data.get('email', ''))
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        is_admin=is_admin_flag
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Register successful", "is_admin": is_admin_flag}), 201

@auth_bp.route('/login', methods=['POST'])
@require_json_fields('email', 'password')
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        if getattr(user, 'is_banned', False):
            return jsonify({"message": "Account banned. Contact support."}), 403
        
        if is_admin_email(user.email) and not user.is_admin:
            user.is_admin = True
            db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "risk_profile": user.risk_profile,
                "is_admin": bool(user.is_admin)
            }
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    try:
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        return jsonify({"access_token": access_token}), 200
    except Exception:
        return jsonify({"message": "Failed to refresh token"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = User.query.get(get_jwt_identity())
    if not user: return jsonify({"message": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "risk_profile": user.risk_profile,
        "is_admin": user.is_admin
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = User.query.get(get_jwt_identity())
    if not user: return jsonify({"message": "User not found"}), 404
    user.risk_profile = request.json
    db.session.commit()
    return jsonify({"message": "Profile updated", "risk_profile": user.risk_profile}), 200