# fix_db.py
from database import engine
from sqlalchemy import text

with engine.connect() as connection:
    # Drop policies (old fix)
    connection.execute(text("DROP TABLE IF EXISTS policies CASCADE"))
    # NEW: Drop users to reset schema for new column
    connection.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    connection.execute(text("DROP TABLE IF EXISTS userpolicies CASCADE"))
    connection.commit()
    print("✅ All tables dropped. Restart backend to recreate with new Schema.")