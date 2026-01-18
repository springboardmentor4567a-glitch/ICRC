import sqlite3

conn = sqlite3.connect("infosys_db.sqlite3")
c = conn.cursor()

try:
    c.execute("ALTER TABLE notifications ADD COLUMN is_read INTEGER DEFAULT 0")
    print("Column added successfully!")
except Exception as e:
    print("Maybe already exists:", e)

conn.commit()
conn.close()
