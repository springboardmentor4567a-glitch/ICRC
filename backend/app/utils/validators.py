from functools import wraps
from flask import request, jsonify

def require_json_fields(*fields):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({"message": "Invalid or missing JSON body"}), 400
            data = request.get_json(silent=True)
            if not data:
                return jsonify({"message": "JSON body is empty"}), 400
            missing = [f for f in fields if f not in data]
            if missing:
                return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
            return fn(*args, **kwargs)
        return wrapper
    return decorator