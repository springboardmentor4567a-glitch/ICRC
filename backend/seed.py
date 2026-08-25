# seed.py  -- SAFE IDEMPOTENT VERSION
# This script NEVER deletes existing providers or policies.
# It uses policy_number as the uniqueness key to prevent duplicates.
# Safe to run multiple times.
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)


def get_or_create_provider(db, code, name, description):
    """Return existing provider by code, or create it if missing. NEVER deletes."""
    existing = db.query(models.Provider).filter(models.Provider.code == code).first()
    if existing:
        return existing
    provider = models.Provider(name=name, code=code, description=description)
    db.add(provider)
    db.commit()
    db.refresh(provider)
    print(f"  [NEW PROVIDER] {name} ({code})")
    return provider


def upsert_policy(db, provider_id, **kwargs):
    """Insert policy only if policy_number does not already exist. NEVER deletes."""
    pnum = kwargs.get("policy_number")
    existing = db.query(models.Policy).filter(
        models.Policy.policy_number == pnum
    ).first()
    if existing:
        print(f"  [SKIP - exists] {pnum} | {existing.name}")
        return existing
    policy = models.Policy(provider_id=provider_id, **kwargs)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    print(f"  [NEW POLICY]   {pnum} | {policy.name}")
    return policy


def seed():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("ICRC Safe Seed -- idempotent, NEVER deletes existing data")
        print("=" * 60)

        # --- Ensure original 5 providers exist (get, never recreate) ---
        lic   = get_or_create_provider(db, "LIC",   "LIC",              "Life Insurance Corporation")
        hdfc  = get_or_create_provider(db, "HDFC",  "HDFC Life",        "HDFC Life Insurance")
        star  = get_or_create_provider(db, "STAR",  "Star Health",      "Star Health Insurance")
        tata  = get_or_create_provider(db, "TATA",  "Tata AIA",         "Tata AIA Insurance")
        icici = get_or_create_provider(db, "ICICI", "ICICI Prudential", "ICICI Insurance")

        # --- Add 3 new providers for new categories (if not present) ---
        bajaj  = get_or_create_provider(db, "BAJAJ",  "Bajaj Allianz",       "Bajaj Allianz General Insurance (Demo)")
        newind = get_or_create_provider(db, "NEWIND", "New India Assurance", "New India Assurance Co. Ltd. (Demo)")
        ergo   = get_or_create_provider(db, "ERGO",   "HDFC ERGO",           "HDFC ERGO General Insurance (Demo)")

        # ---------------------------------------------------------------
        # AUTO INSURANCE (5 new policies)
        # Demo values - not official commercial product data
        # ---------------------------------------------------------------
        print("\n--- Auto Insurance (5 policies) ---")
        upsert_policy(db, bajaj.id,
            name="Bajaj Allianz Drive Safe",
            policy_number="BAJAJ6001",
            category="Auto",
            coverage="5,00,000",
            premium=8500,
            benefits="Own damage cover, third-party liability, zero depreciation add-on",
            terms_conditions=(
                "Valid for private four-wheelers registered in India. "
                "Own-damage and third-party liability covered. "
                "Zero-depreciation add-on available. NCB applicable on renewal. "
                "Claims subject to inspection and standard verification."
            )
        )
        upsert_policy(db, bajaj.id,
            name="Bajaj Allianz Motor Protect",
            policy_number="BAJAJ6002",
            category="Auto",
            coverage="3,00,000",
            premium=6200,
            benefits="Third-party liability, personal accident cover for driver",
            terms_conditions=(
                "Third-party only cover as per Motor Vehicles Act. "
                "Covers bodily injury and property damage to third party. "
                "Personal accident cover for owner-driver included. "
                "Policy does not cover own damage."
            )
        )
        upsert_policy(db, newind.id,
            name="New India Vehicle Shield",
            policy_number="NEWIND7001",
            category="Auto",
            coverage="8,00,000",
            premium=11000,
            benefits="Comprehensive cover, roadside assistance, engine protection",
            terms_conditions=(
                "Comprehensive motor policy covering own damage and third-party liability. "
                "24x7 roadside assistance included. Engine protection add-on applicable. "
                "Applicable for cars up to 7 years old. "
                "Claims processed within 30 working days."
            )
        )
        upsert_policy(db, ergo.id,
            name="HDFC ERGO Car Suraksha",
            policy_number="ERGO8001",
            category="Auto",
            coverage="6,00,000",
            premium=9800,
            benefits="Zero depreciation, consumables cover, return to invoice",
            terms_conditions=(
                "Covers loss or damage to the insured vehicle due to accident, fire, theft, or natural calamity. "
                "Zero depreciation and return-to-invoice add-ons available. "
                "Valid for vehicles registered under personal use. "
                "NCB discount applies at renewal based on claim-free years."
            )
        )
        upsert_policy(db, icici.id,
            name="ICICI Lombard Auto Plus",
            policy_number="ICICI5004",
            category="Auto",
            coverage="10,00,000",
            premium=13500,
            benefits="Comprehensive PA cover, towing charges, key replacement",
            terms_conditions=(
                "All-inclusive comprehensive motor insurance with personal accident cover for occupants. "
                "Towing charges up to Rs.1,500 per incident. Key replacement cover included. "
                "Claims must be reported within 24 hours of incident. "
                "Applicable for vehicles up to 10 years old."
            )
        )

        # ---------------------------------------------------------------
        # TRAVEL INSURANCE (5 new policies)
        # ---------------------------------------------------------------
        print("\n--- Travel Insurance (5 policies) ---")
        upsert_policy(db, bajaj.id,
            name="Bajaj Allianz Travel Companion",
            policy_number="BAJAJ6003",
            category="Travel",
            coverage="50,00,000",
            premium=2500,
            benefits="Medical emergency abroad, trip cancellation, lost baggage",
            terms_conditions=(
                "Annual multi-trip travel policy for international travel. "
                "Medical emergency coverage up to USD 50,000. "
                "Trip cancellation and interruption covered up to Rs.50,000. "
                "Lost or delayed baggage covered up to Rs.25,000 per incident. "
                "Pre-existing conditions excluded unless declared and accepted."
            )
        )
        upsert_policy(db, newind.id,
            name="New India Overseas Mediclaim",
            policy_number="NEWIND7002",
            category="Travel",
            coverage="25,00,000",
            premium=3200,
            benefits="Overseas hospitalisation, emergency evacuation, passport loss",
            terms_conditions=(
                "Single-trip overseas travel insurance valid for up to 180 days. "
                "Hospitalisation expenses covered up to USD 25,000. "
                "Emergency evacuation and repatriation of remains included. "
                "Loss of passport and travel documents covered up to Rs.10,000. "
                "Waiting period: 48 hours for illness-related claims."
            )
        )
        upsert_policy(db, ergo.id,
            name="HDFC ERGO Travel Xpert",
            policy_number="ERGO8002",
            category="Travel",
            coverage="75,00,000",
            premium=4100,
            benefits="Global medical cover, flight delay, hijack distress allowance",
            terms_conditions=(
                "Comprehensive travel policy for frequent international travellers. "
                "Global medical coverage up to USD 75,000. "
                "Flight delay allowance after 6 hours. "
                "Hijack distress allowance of USD 100 per day. "
                "Coverage for adventure sports available as optional add-on."
            )
        )
        upsert_policy(db, tata.id,
            name="Tata AIA Domestic Travel Secure",
            policy_number="TATA4004",
            category="Travel",
            coverage="5,00,000",
            premium=1800,
            benefits="Domestic trip cover, missed connections, personal accident",
            terms_conditions=(
                "Single-trip domestic travel insurance covering rail and air travel within India. "
                "Personal accident benefit of Rs.5,00,000 for the insured. "
                "Missed connection and trip delay benefit of Rs.2,000 per event. "
                "Lost baggage covered up to Rs.10,000. "
                "Policy active from departure to return date as declared."
            )
        )
        upsert_policy(db, hdfc.id,
            name="HDFC Life Travel Guard",
            policy_number="HDFC2004",
            category="Travel",
            coverage="30,00,000",
            premium=2800,
            benefits="Medical expenses, sponsor protection, study interruption",
            terms_conditions=(
                "Student travel insurance for Indians studying abroad. "
                "Medical expenses covered up to USD 30,000. "
                "Sponsor protection benefit in case of sponsor accidental death. "
                "Study interruption covered up to Rs.2,00,000. "
                "Policy cannot be purchased after departure from India."
            )
        )

        # ---------------------------------------------------------------
        # PERSONAL ACCIDENT / PROPERTY (5 new policies)
        # ---------------------------------------------------------------
        print("\n--- Personal Accident / Property (5 policies) ---")
        upsert_policy(db, newind.id,
            name="New India Personal Accident Shield",
            policy_number="NEWIND7003",
            category="Personal Accident",
            coverage="15,00,000",
            premium=4500,
            benefits="Accidental death, permanent disability, weekly compensation",
            terms_conditions=(
                "Individual personal accident policy covering accidental death and disability. "
                "100% sum insured paid on accidental death or permanent total disability. "
                "Partial disability covered on proportionate basis. "
                "Weekly compensation of Rs.2,000 for temporary total disability. "
                "Occupational risk surcharge may apply for high-risk occupations."
            )
        )
        upsert_policy(db, bajaj.id,
            name="Bajaj Allianz Accident Guard",
            policy_number="BAJAJ6004",
            category="Personal Accident",
            coverage="10,00,000",
            premium=3800,
            benefits="Accidental death + disability, ambulance charges, education benefit",
            terms_conditions=(
                "Group or individual personal accident policy. "
                "Accidental death and permanent total disability covered at 100% SI. "
                "Ambulance charges up to Rs.5,000 per incident. "
                "Education benefit for dependent children in case of death. "
                "24x7 worldwide cover for accident events."
            )
        )
        upsert_policy(db, ergo.id,
            name="HDFC ERGO My Home Shield",
            policy_number="ERGO8003",
            category="Property",
            coverage="20,00,000",
            premium=7500,
            benefits="Fire and allied perils, burglary, public liability for home",
            terms_conditions=(
                "Home insurance covering building structure and household contents. "
                "Fire, explosion, lightning, earthquake, flood covered. "
                "Burglary and housebreaking covered up to Rs.5,00,000. "
                "Public liability for bodily injury to third party on premises. "
                "Jewellery covered up to 25% of contents sum insured."
            )
        )
        upsert_policy(db, tata.id,
            name="Tata AIA Suraksha PA",
            policy_number="TATA4005",
            category="Personal Accident",
            coverage="20,00,000",
            premium=5200,
            benefits="Accidental death, hospitalisation allowance, fracture benefit",
            terms_conditions=(
                "Comprehensive personal accident policy for individuals aged 5 to 70. "
                "Accidental death benefit of full sum insured. "
                "Hospitalisation allowance of Rs.1,000 per day up to 30 days. "
                "Fracture benefit schedule applicable for bone fractures. "
                "No medical examination required for sum insured up to Rs.20,00,000."
            )
        )
        upsert_policy(db, newind.id,
            name="New India Householder Policy",
            policy_number="NEWIND7004",
            category="Property",
            coverage="12,00,000",
            premium=5800,
            benefits="Building + contents cover, pedal cycle, domestic appliances",
            terms_conditions=(
                "Comprehensive householder insurance for owned or rented premises. "
                "Building structure and household contents insured against fire and allied perils. "
                "Domestic appliances, pedal cycle, and personal computers covered. "
                "Plate glass breakage and personal accident add-ons available. "
                "Claim must be reported within 7 days of loss or damage."
            )
        )

        # ---------------------------------------------------------------
        # SUMMARY
        # ---------------------------------------------------------------
        total = db.query(models.Policy).count()
        total_prov = db.query(models.Provider).count()
        print(f"\n{'=' * 60}")
        print(f"Seed complete.")
        print(f"Total providers in DB : {total_prov}")
        print(f"Total policies  in DB : {total}")
        print("Existing records were NOT deleted or modified.")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    seed()
