from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Claim, Policies, User
from app.utils.email import send_claim_status_email

router = APIRouter(prefix="/admin", tags=["Admin"])


# 🔹 Get ALL claims (Admin view)
@router.get("/claims")
def get_all_claims(db: Session = Depends(get_db)):
    claims = (
        db.query(Claim, Policies.policy_name)
        .join(Policies, Claim.policy_id == Policies.id)
        .all()
    )

    return [
        {
            "id": c.Claim.id,
            "policy_name": c.policy_name,
            "amount": c.Claim.claim_amount,
            "status": c.Claim.status,
            "date": c.Claim.created_at
        }
        for c in claims
    ]


# 🔹 Approve / Reject claim + SEND EMAIL
@router.put("/claims/{claim_id}")
def update_claim_status(claim_id: int, status: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    # ✅ Update status
    claim.status = status
    db.commit()
    db.refresh(claim)

    # ✅ Get user details
    user = db.query(User).filter(User.id == claim.user_id).first()

    if user:
        send_claim_status_email(
            to_email=user.email,
            name=user.name,
            claim_id=claim.id,
            status=status
        )

    return {"message": f"Claim {status} and email sent successfully"}

