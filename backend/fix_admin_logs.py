from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

def fix_admin_table():
    with app.app_context():
        print("🛠️ Fixing Admin Logs Table...")
        try:
            # 1. Check if column exists
            check_col = db.session.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='admin_logs' AND column_name='target_type';"
            )).fetchone()

            if not check_col:
                print("   ➕ Adding 'target_type' column...")
                db.session.execute(text("ALTER TABLE admin_logs ADD COLUMN target_type VARCHAR(50);"))
                db.session.execute(text("ALTER TABLE admin_logs ADD COLUMN target_id INTEGER;"))
                db.session.commit()
                print("   ✅ Columns added successfully.")
            else:
                print("   ℹ️ Columns already exist.")

        except Exception as e:
            print(f"   ❌ Error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    fix_admin_table()