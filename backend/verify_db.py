import sqlite3

conn = sqlite3.connect("infosys_db.sqlite3")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users);")
print(cursor.fetchall())

conn.close()
