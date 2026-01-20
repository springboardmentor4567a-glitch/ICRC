from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.claim import Claim
from app.auth import get_current_user
from app.models.user import User
import json
from datetime import datetime

router = APIRouter()

@router.post("/debug")
async def debug_claim_submission(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Emergency debug endpoint for claim submission"""
    try:
        # Log everything for debugging
        print("=" * 50)
        print("🚨 EMERGENCY DEBUG ENDPOINT HIT")
        print("=" * 50)
        
        # Get request body
        body = await request.body()
        print(f"📥 Raw body: {body}")
        
        # Parse JSON
        data = await request.json()
        print(f"📥 Parsed JSON: {data}")
        
        # Log current user
        print(f"👤 Current user: {current_user.id} ({current_user.email})")
        
        # Validate required fields
        required_fields = ['policy_id', 'claim_type', 'incident_date', 'location', 'amount_requested', 'description']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            raise HTTPException(400, detail=f"Missing required fields: {missing_fields}")
        
        # Create claim directly
        db_claim = Claim(
            user_id=current_user.id,
            policy_id=int(data['policy_id']),
            claim_type=data['claim_type'],
            incident_date=datetime.strptime(data['incident_date'], '%Y-%m-%d').date(),
            location=data['location'],
            amount_requested=float(data['amount_requested']),
            description=data['description'],
            status="pending"
        )
        
        print(f"💾 Creating claim: {db_claim.__dict__}")
        
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        
        print(f"✅ Claim created successfully: ID {db_claim.claim_id}")
        print("=" * 50)
        
        return {
            "success": True,
            "claim_id": db_claim.claim_id,
            "status": "pending",
            "message": "Claim submitted successfully via debug endpoint"
        }
        
    except Exception as e:
        print(f"❌ Error in debug endpoint: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(500, detail=f"Debug endpoint error: {str(e)}")