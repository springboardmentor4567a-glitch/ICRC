import sqlite3
import os

db_path = os.path.join("app", "users.db")
print(f"Database path: {db_path}")
print(f"Database exists: {os.path.exists(db_path)}")

try:
    conn = sqlite3.connect(db_path, timeout=5, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout = 5000")
    c = conn.cursor()
    c.execute("SELECT count(*) FROM users")
    print(f"Users count: {c.fetchone()[0]}")
    conn.close()
    print("Database connection successful")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
