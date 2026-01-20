from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Claim, Policies
from datetime import datetime
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================
# CREATE CLAIM (USER)
# ============================
@router.post("/claims/")
def create_claim(
    policy_id: int = Form(...),
    claim_amount: float = Form(...),
    reason: str = Form(...),
    document: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # ✅ Validate policy exists
    policy = db.query(Policies).filter(Policies.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=400, detail="Policy not found")

    # ✅ Save uploaded document
    file_path = os.path.join(UPLOAD_DIR, document.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)

    # ✅ Create claim
    claim = Claim(
        user_id=1,  # TEMP user until JWT
        policy_id=policy_id,
        claim_amount=claim_amount,
        reason=reason,
        document_path=file_path,
        status="Submitted",
        created_at=datetime.utcnow()
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)

    return {
        "message": "Claim submitted successfully",
        "claim_id": claim.id
    }


# ============================
# GET CLAIMS FOR LOGGED-IN USER
# ============================
@router.get("/claims/user/{user_id}")
def get_user_claims(user_id: int, db: Session = Depends(get_db)):
    claims = db.query(Claim).filter(Claim.user_id == user_id).all()

    return [
        {
            "id": c.id,
            "policy_id": c.policy_id,
            "claim_amount": c.claim_amount,
            "status": c.status,
            "created_at": c.created_at
        }
        for c in claims
    ]


# ============================
# GET ALL CLAIMS (ADMIN)
# ============================
@router.get("/claims/")
def get_all_claims(db: Session = Depends(get_db)):
    claims = db.query(Claim).all()

    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "policy_id": c.policy_id,
            "claim_amount": c.claim_amount,
            "status": c.status,
            "created_at": c.created_at
        }
        for c in claims
    ]


# ============================
# UPDATE CLAIM STATUS (ADMIN)
# ============================
@router.patch("/claims/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    status: str = Query(..., enum=["Approved", "Rejected"]),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = status
    db.commit()

    return {
        "message": f"Claim {status} successfully"
    }
