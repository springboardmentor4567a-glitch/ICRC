from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User

risk_bp = Blueprint('risk', __name__)

# --- GET RISK PROFILE ---
@risk_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_risk_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        return jsonify(user.risk_profile or {}), 200

    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"message": "Server error"}), 500

# --- SAVE / UPDATE RISK PROFILE ---
@risk_bp.route('/save', methods=['POST'])
@jwt_required()
def save_risk_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.get_json()
        
        # Validation (optional but recommended)
        if not data:
            return jsonify({"message": "No data provided"}), 400

        # Update the user's risk_profile field (JSON column)
        user.risk_profile = data
        
        db.session.commit()
        
        return jsonify({
            "message": "Risk profile saved successfully!", 
            "profile": user.risk_profile
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error saving profile: {e}")
        return jsonify({"message": "Failed to save profile"}), 500