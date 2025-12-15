from database import engine
from sqlalchemy import text

# The 'CASCADE' keyword forces the deletion even if other tables link to it
with engine.connect() as connection:
    connection.execute(text("DROP TABLE IF EXISTS policies CASCADE"))
    connection.commit()
    print("✅ Broken 'policies' table deleted successfully.")