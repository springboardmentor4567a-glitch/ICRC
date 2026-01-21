from fastapi import APIRouter

router = APIRouter()

@router.get("/policies")
async def get_policies():
    # Return sample policies since we simplified the backend
    policies = [
        {
            'id': 1,
            'name': "Comprehensive Health Insurance",
            'category': "Health",
            'provider': "HealthCorp",
            'coverage': {"hospitalization": 1000000, "day_care": 50000},
            'base_premium': 5000,
            'rating': 4.5,
            'features': ["Hospitalization", "Day Care", "Ambulance"],
            'term_months': 12,
            'deductible': 0,
            'description': "Complete health coverage for individuals and families"
        },
        {
            'id': 2,
            'name': "Term Life Insurance",
            'category': "Life",
            'provider': "LifeSecure",
            'coverage': {"death_benefit": 5000000},
            'base_premium': 3000,
            'rating': 4.2,
            'features': ["Death Benefit", "Terminal Illness", "Accidental Death"],
            'term_months': 240,
            'deductible': 0,
            'description': "Affordable life insurance for long-term protection"
        },
        {
            'id': 3,
            'name': "Car Insurance",
            'category': "Auto",
            'provider': "AutoGuard",
            'coverage': {"third_party": 2000000, "own_damage": 1000000},
            'base_premium': 4000,
            'rating': 4.0,
            'features': ["Third Party Liability", "Own Damage", "Theft"],
            'term_months': 12,
            'deductible': 0,
            'description': "Comprehensive auto insurance coverage"
        },
        {
            'id': 4,
            'name': "Home Insurance",
            'category': "Property",
            'provider': "HomeSafe",
            'coverage': {"structure": 3000000, "contents": 1000000},
            'base_premium': 6000,
            'rating': 4.3,
            'features': ["Structure", "Contents", "Burglary"],
            'term_months': 12,
            'deductible': 0,
            'description': "Protect your home and belongings"
        }
    ]
    return policies
