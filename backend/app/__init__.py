from flask import Flask
from flask_cors import CORS
from app.extensions import db, jwt, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    with app.app_context():
        # Import Blueprints
        from app.modules.auth.routes import auth_bp
        from app.modules.policies.routes import policies_bp
        from app.modules.claims.routes import claims_bp
        from app.modules.admin.routes import admin_bp
        from app.modules.calculator.routes import calculator_bp
        
        # ✅ NEW IMPORTS
        from app.modules.profile.routes import profile_bp
        from app.modules.recommendations.routes import recommendations_bp

        # Register Blueprints
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(policies_bp, url_prefix='/api/policies')
        app.register_blueprint(claims_bp, url_prefix='/api/claims')
        app.register_blueprint(admin_bp, url_prefix='/api/admin')
        app.register_blueprint(calculator_bp, url_prefix='/api/calculator')
        
        # ✅ NEW REGISTRATIONS
        app.register_blueprint(profile_bp, url_prefix='/api/profile')
        app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')

        db.create_all()

    return app