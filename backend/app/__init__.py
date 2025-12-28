from flask import Flask
from flask_cors import CORS
from .extensions import db, jwt
import os
from dotenv import load_dotenv

# Import all blueprints
from .routes.auth import auth_bp
from .routes.policies import policies_bp
from .routes.recommendations import recommendations_bp
from .routes.claims import claims_bp
from .routes.profile import profile_bp
from .routes.risk import risk_bp  # ✅ ADDED MISSING IMPORT

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # 1. ALLOW CORS GLOBALLY
    # Use /api/* to specifically target your API routes
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    
    # ✅ Fallback to SQLite if DATABASE_URL is missing in .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///database.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret')
    
    db.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(policies_bp, url_prefix='/api/policies')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(risk_bp, url_prefix='/api/risk') # ✅ REGISTERED HERE

    return app