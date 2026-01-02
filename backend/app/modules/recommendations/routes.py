from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .services import RecommendationService

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    result = RecommendationService.generate_recommendations(get_jwt_identity())
    return jsonify(result), 200