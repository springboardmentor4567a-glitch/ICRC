from flask import jsonify

def init_app(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"message": str(e) if hasattr(e, 'description') else "Bad Request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"message": "Resource Not Found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"message": "Internal Server Error"}), 500

class AppError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code