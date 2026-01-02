from flask import Flask
from .extensions import db, jwt, cors
from .utils.errors import init_app as init_errors
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'secret')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    init_errors(app)

    # Register Blueprints
    from .modules.auth.routes import auth_bp
    from .modules.policies.routes import policies_bp
    from .modules.claims.routes import claims_bp
    from .modules.profile.routes import profile_bp
    from .modules.recommendations.routes import recommendations_bp
    from .modules.admin.routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(policies_bp, url_prefix='/api/policies')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    with app.app_context():
        db.create_all()

    return app