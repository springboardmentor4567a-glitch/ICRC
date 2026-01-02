from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .services import RiskService

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        data = RiskService.get_profile(get_jwt_identity())
        return jsonify(data), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 404
    except Exception as e:
        return jsonify({"message": "Server error"}), 500

@risk_bp.route('/save', methods=['POST'])
@jwt_required()
def save_profile():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        updated_profile = RiskService.update_profile(get_jwt_identity(), data)
        return jsonify({
            "message": "Risk profile saved successfully", 
            "profile": updated_profile
        }), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 404
    except Exception as e:
        return jsonify({"message": "Failed to save profile"}), 500