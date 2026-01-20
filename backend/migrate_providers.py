from app import create_app
from app.extensions import db
from sqlalchemy import text, inspect

# Initialize App
app = create_app()

def run_migration():
    with app.app_context():
        print("🔄 Starting PostgreSQL Migration...")

        # 1. Create 'providers' table
        try:
            print("   Checking 'providers' table...")
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS providers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    country VARCHAR(50) DEFAULT 'India',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            print("   ✅ 'providers' table verified.")
        except Exception as e:
            print(f"   ⚠️ Error checking table: {e}")

        # 2. Add 'provider_id' column to 'policies'
        try:
            # Check if column exists
            check_col = db.session.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='policies' AND column_name='provider_id';"
            )).fetchone()

            if not check_col:
                print("   ➕ Adding 'provider_id' column to policies...")
                db.session.execute(text("ALTER TABLE policies ADD COLUMN provider_id INTEGER REFERENCES providers(id);"))
                db.session.commit()
            else:
                print("   ℹ️ 'provider_id' column already exists.")
        except Exception as e:
            print(f"   ⚠️ Error altering table: {e}")
            db.session.rollback()

        # 3. MIGRATE DATA (Conditional)
        print("   📊 Checking for old data...")
        try:
            # Check if the old 'provider' (string) column exists
            check_old_col = db.session.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='policies' AND column_name='provider';"
            )).fetchone()

            if not check_old_col:
                print("   ✅ Old 'provider' column NOT found. Assuming fresh DB or already migrated.")
                print("   🎉 Migration Complete! No data copy needed.")
                return

            # If column exists, proceed with migration
            print("   ⚠️ Found old 'provider' column. Migrating data...")
            policies = db.session.execute(text("SELECT id, title, provider FROM policies")).fetchall()
            
            migrated_count = 0
            for row in policies:
                p_id, p_title, p_name_str = row

                if not p_name_str: continue

                # Find or Create Provider
                existing_prov = db.session.execute(text("SELECT id FROM providers WHERE name = :name"), {"name": p_name_str}).fetchone()
                
                if existing_prov:
                    prov_id = existing_prov[0]
                else:
                    result = db.session.execute(
                        text("INSERT INTO providers (name, country) VALUES (:name, 'India') RETURNING id"),
                        {"name": p_name_str}
                    )
                    prov_id = result.fetchone()[0]
                    print(f"      🆕 Created Provider: {p_name_str}")

                # Update Policy
                db.session.execute(
                    text("UPDATE policies SET provider_id = :prov_id WHERE id = :p_id"),
                    {"prov_id": prov_id, "p_id": p_id}
                )
                migrated_count += 1
            
            db.session.commit()
            print(f"   ✅ Successfully migrated {migrated_count} policies.")

        except Exception as e:
            print(f"   ❌ Data migration failed: {e}")
            db.session.rollback()

if __name__ == "__main__":
    run_migration()