from database import SessionLocal
import models

# 1. Connect to the Database
db = SessionLocal()

# 2. Check if database is already full
existing_policies = db.query(models.Policy).first()

if existing_policies:
    print("⚠️  Database already has policies! Skipping seed.")
    print("ℹ️  (To reset: Stop server -> Run 'python fix_db.py' -> Start server -> Stop server -> Run 'python seed.py')")
else:
    print("🌱 Seeding database with 50+ Insurance Policies...")

    policies = [
        # --- HEALTH INSURANCE ---
        models.Policy(category="Health", policy_name="Activ Health Platinum", provider="Aditya Birla", premium=12000, cover_amount=500000, description="Comprehensive health cover with chronic management program.", features="Cashless treatment, Day care procedures, Reload of sum insured"),
        models.Policy(category="Health", policy_name="Optima Restore", provider="HDFC Ergo", premium=15000, cover_amount=1000000, description="Restores your sum insured automatically if exhausted.", features="No claim bonus, Free health checkup, 100% Restore benefit"),
        models.Policy(category="Health", policy_name="ReAssure 2.0", provider="Niva Bupa", premium=18000, cover_amount=1500000, description="Unlimited sum insured recharges tailored for families.", features="Lock the clock age, Booster benefit, Safeguard rider"),
        models.Policy(category="Health", policy_name="Young Star Gold", provider="Star Health", premium=8000, cover_amount=300000, description="Affordable plan specifically designed for young adults.", features="Maternity cover NOT included, Low waiting period, E-medical opinion"),
        models.Policy(category="Health", policy_name="Care Supreme", provider="Care Insurance", premium=11500, cover_amount=700000, description="Unlimited automatic recharge of sum insured.", features="Unlimited E-consultation, Cumulative bonus up to 500%, AYUSH treatment"),
        models.Policy(category="Health", policy_name="My:Health Suraksha", provider="HDFC Ergo", premium=9500, cover_amount=500000, description="Silver Smart Plan for individuals.", features="Air Ambulance, Recovery benefit, Mental healthcare"),
        models.Policy(category="Health", policy_name="MediPrime", provider="Tata AIG", premium=13000, cover_amount=500000, description="No sub-limits on room rent or diseases.", features="Global cover, Consumables benefit, Restore benefit"),
        models.Policy(category="Health", policy_name="Health Companion", provider="Niva Bupa", premium=11000, cover_amount=500000, description="Affordable family floater plan.", features="Direct claim settlement, Refill benefit, No claim bonus"),
        models.Policy(category="Health", policy_name="Arogya Sanjeevani", provider="SBI General", premium=6000, cover_amount=300000, description="Standard health insurance mandated by IRDAI.", features="Low copay, AYUSH treatment, Cataract cover"),
        models.Policy(category="Health", policy_name="Lifeline Supreme", provider="Royal Sundaram", premium=14500, cover_amount=1000000, description="Comprehensive cover for critical illnesses.", features="International treatment, Reload benefit, Health checkup"),

        # --- AUTO INSURANCE ---
        models.Policy(category="Auto", policy_name="Drive Assure Economy", provider="Bajaj Allianz", premium=4500, cover_amount=200000, description="Basic comprehensive coverage for city drivers.", features="Third party liability, Own damage, 24x7 Roadside assistance"),
        models.Policy(category="Auto", policy_name="Car Shield 360", provider="ICICI Lombard", premium=7800, cover_amount=500000, description="All-round protection including engine and gearbox cover.", features="Zero depreciation, Engine protect, Key replacement"),
        models.Policy(category="Auto", policy_name="Digit Private Car", provider="Go Digit", premium=3200, cover_amount=150000, description="Super fast claims with smartphone self-inspection.", features="3-day claim settlement, Customizable IDV, Pick up & Drop"),
        models.Policy(category="Auto", policy_name="Acko Smart Driver", provider="Acko", premium=2900, cover_amount=100000, description="Low cost insurance for safe drivers.", features="Instant claim settlement, Zero paperwork, Doorstep repair"),
        models.Policy(category="Auto", policy_name="Secure Drive Plus", provider="Tata AIG", premium=9500, cover_amount=800000, description="High-value coverage for luxury and SUV vehicles.", features="Return to invoice, Consumables cover, Tyre protection"),
        models.Policy(category="Auto", policy_name="Motor Protect", provider="HDFC Ergo", premium=5500, cover_amount=400000, description="Overnight repair service included.", features="Doorstep repair, Zero Dep, No claim bonus protection"),
        models.Policy(category="Auto", policy_name="Kotak Car Secure", provider="Kotak General", premium=4100, cover_amount=300000, description="Flexible add-ons for city driving.", features="Consumables cover, Engine protect, Roadside assistance"),
        models.Policy(category="Auto", policy_name="Reliance Car Policy", provider="Reliance General", premium=3800, cover_amount=250000, description="Video based claims processing.", features="Free towing, Instant renewal, Personal accident cover"),
        models.Policy(category="Auto", policy_name="Chola MS Protect", provider="Cholamandalam", premium=6200, cover_amount=450000, description="Comprehensive plan with daily allowance.", features="Daily allowance, Key replacement, Hydrostatic lock cover"),
        models.Policy(category="Auto", policy_name="Navi Car Insurance", provider="Navi", premium=2500, cover_amount=100000, description="App based instant insurance.", features="Cashless network, fast settlement, Digital policy"),

        # --- LIFE INSURANCE ---
        models.Policy(category="Life", policy_name="iSelect Smart360", provider="Canara HSBC", premium=10000, cover_amount=10000000, description="Pure term plan with return of premium option.", features="Spouse cover, Block your premium, Terminal illness cover"),
        models.Policy(category="Life", policy_name="Click 2 Protect", provider="HDFC Life", premium=12500, cover_amount=15000000, description="Flexible term plan with 3D protection (Disease, Death, Disability).", features="Waiver of premium on disability, Tax benefits, Accidental death rider"),
        models.Policy(category="Life", policy_name="eShield Next", provider="SBI Life", premium=9000, cover_amount=7500000, description="Level cover with future-proofing benefits.", features="Increase cover on marriage/childbirth, Better half benefit, Death benefit payout options"),
        models.Policy(category="Life", policy_name="Saral Jeevan Bima", provider="LIC", premium=5000, cover_amount=2500000, description="Standard simple term life insurance for everyone.", features="Govt backed, Simple terms, 45 days waiting period"),
        models.Policy(category="Life", policy_name="Smart Protect", provider="Max Life", premium=14000, cover_amount=20000000, description="High cover term plan for complete family security.", features="Critical illness benefit, Accident cover, Long term coverage (up to 85 yrs)"),
        models.Policy(category="Life", policy_name="iTerm Prime", provider="Aegon Life", premium=8500, cover_amount=10000000, description="Online term plan with zero paperwork.", features="Covid-19 cover, Terminal illness, Tax benefits"),
        models.Policy(category="Life", policy_name="Pramerica TruShield", provider="Pramerica Life", premium=9800, cover_amount=8000000, description="Protection with monthly income option.", features="Monthly payout, Return of premium, Critical illness"),
        models.Policy(category="Life", policy_name="Edelweiss Zindagi", provider="Edelweiss Tokio", premium=11000, cover_amount=10000000, description="Better half benefit included.", features="Spouse cover, Child's future protect, Waiver of premium"),

        # --- TRAVEL INSURANCE ---
        models.Policy(category="Travel", policy_name="Travel Elite Gold", provider="Tata AIG", premium=1500, cover_amount=3500000, description="Comprehensive international travel insurance.", features="Medical expenses, Flight delay, Baggage loss, Passport loss"),
        models.Policy(category="Travel", policy_name="Explore Asia", provider="Care Insurance", premium=900, cover_amount=1000000, description="Specific plan for travelers visiting Asian countries.", features="Trip cancellation, Medical evacuation, Hijack distress allowance"),
        models.Policy(category="Travel", policy_name="Digit International", provider="Go Digit", premium=1200, cover_amount=2000000, description="Flat rate for all countries.", features="Zero deductible, Flight delay, Missed connection"),
        models.Policy(category="Travel", policy_name="Religare Student", provider="Religare", premium=4000, cover_amount=5000000, description="Special plan for students studying abroad.", features="University insolvency, Study interruption, Sponsor protection"),
        models.Policy(category="Travel", policy_name="Bajaj Travel Ace", provider="Bajaj Allianz", premium=1800, cover_amount=2500000, description="Corporate travel plan.", features="Missed connection, Bounced hotel, Emergency cash"),

        # --- HOME INSURANCE ---
        models.Policy(category="Home", policy_name="My Home Shield", provider="HDFC Ergo", premium=3000, cover_amount=5000000, description="Complete protection for structure and contents.", features="Fire, Theft, Electrical breakdown"),
        models.Policy(category="Home", policy_name="Bharat Griha Raksha", provider="SBI General", premium=1500, cover_amount=2000000, description="Standard fire policy mandated by government.", features="Natural calamities, Fire, Impact damage"),
        models.Policy(category="Home", policy_name="Home Protect", provider="ICICI Lombard", premium=4500, cover_amount=10000000, description="High value home insurance.", features="Terrorism cover, Burglary, Jewelry cover"),
        models.Policy(category="Home", policy_name="Digit Home", provider="Go Digit", premium=2000, cover_amount=3000000, description="For tenants and owners.", features="Jewelry protection, Electronic breakdown, Portable equipment"),
        models.Policy(category="Home", policy_name="Insta Home", provider="Bajaj Allianz", premium=2800, cover_amount=4000000, description="Quick issue home insurance.", features="Portable electronics, Key replacement, ATM withdrawal robbery"),
        models.Policy(category="Home", policy_name="Royal Home", provider="Royal Sundaram", premium=3500, cover_amount=6000000, description="Protection for independent villas.", features="Glass breakage, Employee dishonesty, Public liability"),

        # --- CYBER & GADGET INSURANCE ---
        models.Policy(category="Cyber", policy_name="Cyber Safe", provider="HDFC Ergo", premium=2000, cover_amount=100000, description="Protection against online fraud.", features="Identity theft, Phishing, Email spoofing"),
        models.Policy(category="Cyber", policy_name="Digital Act", provider="Bajaj Allianz", premium=1500, cover_amount=50000, description="Social media liability cover.", features="Cyber bullying, Cyber stalking, Data breach"),
        models.Policy(category="Gadget", policy_name="Mobile Protect", provider="Acko", premium=999, cover_amount=50000, description="Screen damage protection.", features="Liquid damage, Accidental drop, Theft"),
        models.Policy(category="Gadget", policy_name="Laptop Secure", provider="OneAssist", premium=2500, cover_amount=100000, description="Extended warranty and damage.", features="Breakdown, Liquid spill, Circuit failure"),
        
        # --- PET INSURANCE ---
        models.Policy(category="Pet", policy_name="Paw Protect", provider="Digit", premium=3000, cover_amount=40000, description="Insurance for your furry friend.", features="Vet fees, Surgery, Third party liability"),
    ]

    # 4. Add to Database
    db.add_all(policies)
    db.commit()
    print("✅ Successfully seeded database with 50+ new policies!")

# 5. Close connection
db.close()