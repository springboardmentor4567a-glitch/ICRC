# export_users.py
import sqlite3
import csv
import html
from pathlib import Path
import sys

DB_PATH = Path("infosys_db.sqlite3")
CSV_OUT = Path("users_export.csv")
HTML_OUT = Path("users_export.html")

if not DB_PATH.exists():
    print(f"ERROR: database file not found at {DB_PATH.resolve()}")
    sys.exit(1)

conn = sqlite3.connect(str(DB_PATH))
conn.row_factory = sqlite3.Row
cur = conn.cursor()

try:
    cur.execute("SELECT id, name, email, created_at FROM users ORDER BY id;")
    rows = cur.fetchall()
except sqlite3.OperationalError as e:
    print("SQL error:", e)
    conn.close()
    sys.exit(1)

# Write CSV
with CSV_OUT.open("w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "name", "email", "created_at"])
    for r in rows:
        writer.writerow([r["id"], r["name"], r["email"], r["created_at"]])

# Write simple HTML table
with HTML_OUT.open("w", encoding="utf-8") as f:
    f.write("""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Registered Users - export</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; padding:20px; background:#f7fafc }
  table { border-collapse: collapse; width: 100%; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
  th, td { padding: 12px 14px; border-bottom: 1px solid #eef2f7; text-align:left; }
  th { background: linear-gradient(90deg,#f1f5f9,#eef2ff); font-weight:700; }
  caption { font-size:18px; margin-bottom:12px; font-weight:800; color:#0f172a; }
  .muted { color:#67707a; font-size:13px; margin-top:10px; }
</style>
</head>
<body>
<table>
<caption>Registered users (from infosys_db.sqlite3)</caption>
<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Created At</th></tr></thead>
<tbody>
""")
    if not rows:
        f.write('<tr><td colspan="4" class="muted">No users found in users table</td></tr>')
    else:
        for r in rows:
            name = html.escape(r["name"] or "")
            email = html.escape(r["email"] or "")
            created = html.escape(r["created_at"] or "")
            f.write(f"<tr><td>{r['id']}</td><td>{name}</td><td>{email}</td><td>{created}</td></tr>\n")
    f.write("""
</tbody>
</table>
<p class="muted">Downloaded from DB file: {db}</p>
</body></html>
""".format(db=html.escape(str(DB_PATH.resolve()))))

conn.close()

print(f"Wrote CSV -> {CSV_OUT.resolve()}")
print(f"Wrote HTML -> {HTML_OUT.resolve()}")
print(f"Rows exported: {len(rows)}")
if len(rows) > 0:
    print()
    print("Preview (first 5 rows):")
    for r in rows[:5]:
        print(r["id"], "|", r["name"], "|", r["email"], "|", r["created_at"])
