from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

def fix_claims():
    with app.app_context():
        print("🛠️ Checking Claims Table...")
        try:
            # Add 'description' column if missing
            db.session.execute(text("ALTER TABLE claims ADD COLUMN IF NOT EXISTS description TEXT;"))
            print("   ✅ Added 'description' column.")
            
            db.session.commit()
            print("🎉 Database Fixed! You can now restart the server.")
        except Exception as e:
            print(f"   ❌ Error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    fix_claims()