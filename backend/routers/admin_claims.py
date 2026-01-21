from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.models import db, Claim, ClaimStatusHistory
from backend.routers.auth import get_current_user, admin_required
from datetime import datetime

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

@router.get("/api/admin/claims")
async def get_all_claims(current_user: dict = Depends(admin_required)):
    try:
        # Query all claims with user and policy information
        claims = Claim.query.join(UserPolicy).join(User).join(Policy).all()

        claims_data = []
        for claim in claims:
            claims_data.append({
                "id": claim.id,
                "user_id": claim.user_policy.user.id,
                "claim_number": claim.claim_number,
                "claim_type": claim.claim_type,
                "amount_claimed": claim.amount_claimed,
                "status": claim.status,
                "fraud_score": claim.fraud_score,
                "created_at": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                "incident_date": claim.incident_date.isoformat() if claim.incident_date else None
            })

        return claims_data
    except Exception as e:
        print(f"Error fetching claims: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch claims")

@router.put("/api/admin/claims/{claim_id}/status")
async def update_claim_status(claim_id: int, status_update: StatusUpdate, current_user: dict = Depends(admin_required)):
    if status_update.status not in ["approved", "rejected", "processing", "submitted"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        # Find and update the claim in database
        claim = Claim.query.get(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")

        # Only create history entry if status actually changed
        if claim.status != status_update.status:
            # Create new status history entry
            history_entry = ClaimStatusHistory(
                claim_id=claim.id,
                status=status_update.status,
                notes=f"Status updated to {status_update.status} by admin"
            )
            db.session.add(history_entry)

        claim.status = status_update.status
        claim.updated_at = datetime.utcnow()
        db.session.commit()

        return {"message": f"Claim {status_update.status}"}
    except Exception as e:
        db.session.rollback()
        print(f"Error updating claim status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update claim status")
