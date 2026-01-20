from app.database import SessionLocal, engine
from app import models
from app.models import Admin, Policies
from app.utils.security import hash_password

def seed_admin_and_policies():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    admin = db.query(Admin).filter(Admin.email == "admin@gmail.com").first()
    if not admin:
        admin = Admin(
            name="System Admin",
            email="admin@gmail.com",
            password=hash_password("admin123")  # ✅ HASHED
        )
        db.add(admin)
        print("✅ Admin created")

    existing_policy = db.query(Policies).first()
    if not existing_policy:
        policies = [
            Policies(policy_name="Health Secure Plus", coverage_amount=500000),
            Policies(policy_name="Life Shield Plan", coverage_amount=1000000),
            Policies(policy_name="Family Health Pro", coverage_amount=800000),
            Policies(policy_name="Budget Care", coverage_amount=400000),
            Policies(policy_name="Smart Health Cover", coverage_amount=600000),
        ]
        db.add_all(policies)
        print("✅ Policies seeded")

    db.commit()
    db.close()
    print("🎉 Seeding complete")

if __name__ == "__main__":
    seed_admin_and_policies()
