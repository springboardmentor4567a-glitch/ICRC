from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from ..models import User 

auth_bp = Blueprint('auth', __name__)

# --- 1. REGISTER ROUTE ---
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']) # Hash the password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Register successful"}), 201

# --- 2. LOGIN ROUTE ---
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "risk_profile": user.risk_profile 
            }
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401

# --- 3. GET PROFILE (ME) ---
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "risk_profile": user.risk_profile
    }), 200

# --- 4. UPDATE PROFILE ---
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.json
        user.risk_profile = data
        db.session.commit()

        return jsonify({"message": "Profile updated", "risk_profile": user.risk_profile}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Internal Server Error"}), 500