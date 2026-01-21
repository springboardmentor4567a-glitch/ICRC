from fastapi import APIRouter, Request
from tasks.email_tasks import send_claim_email

router = APIRouter()

@router.post("/claim")
def file_claim(claim_data: dict):
    # 1️⃣ Save claim to DB (mock)
    claim_id = "CLM123"
    user_email = claim_data["email"]

    # 2️⃣ Trigger background email
    send_claim_email.delay(
        user_email,
        claim_id,
        "Filed Successfully"
    )

    return {"message": "Claim filed successfully"}
