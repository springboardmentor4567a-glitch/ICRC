from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.claim import Claim, ClaimDocument
from app.models.user import User
from app.schemas import ClaimCreate, ClaimOut, ClaimDocumentCreate, ClaimDocumentOut, ClaimStatusUpdate
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ClaimOut)
def create_claim(
    claim: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_claim = Claim(
        user_id=current_user.id,
        policy_id=claim.policy_id,
        claim_type=claim.claim_type,
        incident_date=claim.incident_date,
        location=claim.location,
        amount_requested=claim.amount_requested,
        description=claim.description,
        status="pending"
    )
    
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    
    # Simple email notification log
    print(f"📧 EMAIL SENT: Claim #{db_claim.claim_id} created (pending) → {current_user.email}")
    
    return db_claim

@router.get("/", response_model=List[ClaimOut])
def get_user_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claims = db.query(Claim).filter(Claim.user_id == current_user.id).order_by(Claim.created_at.desc()).all()
    return claims

@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(
        Claim.claim_id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )
    
    return claim

@router.post("/{claim_id}/documents", response_model=ClaimDocumentOut)
def add_claim_document(
    claim_id: int,
    document: ClaimDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(
        Claim.claim_id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )
    
    db_document = ClaimDocument(
        claim_id=claim_id,
        s3_key=document.s3_key,
        filename=document.filename,
        size_bytes=document.size_bytes
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return db_document

@router.get("/{claim_id}/documents", response_model=List[ClaimDocumentOut])
def get_claim_documents(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(
        Claim.claim_id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )
    
    documents = db.query(ClaimDocument).filter(ClaimDocument.claim_id == claim_id).all()
    return documents

@router.put("/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    status_update: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(
        Claim.claim_id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )
    
    valid_statuses = ["pending", "approved", "rejected", "paid"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    old_status = claim.status
    claim.status = status_update.status
    db.commit()
    
    # Simple email notification log
    if old_status != status_update.status:
        print(f"📧 EMAIL SENT: Claim #{claim_id} {old_status} → {status_update.status} → {current_user.email}")
    
    return {"message": f"Claim status updated to {status_update.status} ✅"}