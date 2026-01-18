import sqlite3

conn = sqlite3.connect("infosys_db.sqlite3")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;")
    print("Column is_admin added successfully!")
except Exception as e:
    print("Probably column already exists:", e)

conn.commit()
conn.close()
