 from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a secure key

# Connect to SQLite
conn = sqlite3.connect('training_db.db', check_same_thread=False)

cursor = conn.cursor()

# Create users table if it doesn't exist
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    password TEXT
)''')
conn.commit()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    name = data.get("name")
    password = data.get("password")

    if not name or not password:
        return jsonify({"message": "Name and Password required"}), 400

    # Always return success with a fake token
    token = jwt.encode({
        'user_id': 1,
        'name': name,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({"message": "Login Successful", "token": token})

if __name__ == "__main__":
    app.run(debug=True)