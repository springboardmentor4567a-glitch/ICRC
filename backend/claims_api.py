from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import random
from datetime import datetime
from .models import SessionLocal, Claim, ClaimDocument, UserPolicy, ClaimStatusHistory, User, Policy
from .routers.auth import get_current_user, admin_required
from .tasks.email_tasks import send_claim_email
from .s3_utils import upload_file_to_s3
from werkzeug.utils import secure_filename

router = APIRouter()

class ClaimSubmission(BaseModel):
    insurance_type: str
    claim_type: str
    claim_amount: str
    incident_date: str
    incident_type: str
    description: Optional[str] = None

@router.get("/api/claims")
async def get_claims():
    try:
        db = SessionLocal()
        try:
            # Query all claims from database with explicit joins
            claims = db.query(Claim).join(UserPolicy, Claim.user_policy_id == UserPolicy.id)\
                                   .join(User, UserPolicy.user_id == User.id)\
                                   .join(Policy, UserPolicy.policy_id == Policy.id)\
                                   .all()

            claims_data = []
            for claim in claims:
                # Create tracking history from claim status changes
                tracking_history = []
                if claim.created_at:
                    tracking_history.append({
                        "status": "Submitted",
                        "timestamp": claim.created_at.isoformat() + "Z",
                        "notes": "Claim submitted successfully"
                    })
                if claim.status != 'pending' and claim.updated_at:
                    tracking_history.append({
                        "status": claim.status.capitalize(),
                        "timestamp": claim.updated_at.isoformat() + "Z" if claim.updated_at else claim.created_at.isoformat() + "Z",
                        "notes": f"Claim {claim.status}"
                    })

                # Get documents for this claim
                documents = []
                for doc in claim.documents:
                    uploaded_at_str = None
                    if doc.uploaded_at:
                        if isinstance(doc.uploaded_at, str):
                            uploaded_at_str = doc.uploaded_at
                        else:
                            uploaded_at_str = doc.uploaded_at.isoformat() + "Z"

                    documents.append({
                        "id": doc.id,
                        "file_name": doc.file_name,
                        "document_type": doc.document_type,
                        "uploaded_at": uploaded_at_str
                    })

                # Handle incident_date safely
                incident_date_str = None
                if claim.incident_date:
                    if isinstance(claim.incident_date, str):
                        incident_date_str = claim.incident_date
                    else:
                        try:
                            incident_date_str = claim.incident_date.isoformat()
                        except:
                            incident_date_str = str(claim.incident_date)

                claims_data.append({
                    "id": claim.id,
                    "policy_id": f"POL-{claim.user_policy_id}",
                    "insurance_type": claim.user_policy.policy.type if claim.user_policy.policy else "Unknown",
                    "claim_type": claim.claim_type,
                    "claim_amount": claim.amount_claimed,
                    "incident_date": incident_date_str,
                    "incident_type": claim.claim_type,  # Using claim_type as incident_type for simplicity
                    "description": claim.description or "No description provided",
                    "status": claim.status,
                    "created_at": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                    "updated_at": claim.updated_at.isoformat() + "Z" if claim.updated_at else None,
                    "documents": documents,  # Dynamic document list
                    "tracking_history": tracking_history
                })

            return claims_data
        finally:
            db.close()
    except Exception as e:
        print(f"Error fetching claims: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch claims")

@router.get("/api/user/claims")
async def get_user_claims(current_user: dict = Depends(get_current_user)):
    try:
        # Get user ID from token
        user_id = current_user.get('user_id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        print(f"Fetching claims for user_id: {user_id}")

        db = SessionLocal()
        try:
            # Get user policy IDs for this user
            user_policy_ids = [up.id for up in db.query(UserPolicy).filter_by(user_id=user_id).all()]
            print(f"User policy IDs for user {user_id}: {user_policy_ids}")

            # Query claims for this user using policy IDs
            user_claims = db.query(Claim).join(UserPolicy).join(Policy).filter(Claim.user_policy_id.in_(user_policy_ids)).all()
            print(f"Found {len(user_claims)} claims for user {user_id}")

            claims_data = []
            for claim in user_claims:
                # Get tracking history from database
                tracking_history = []
                history_entries = db.query(ClaimStatusHistory).filter_by(claim_id=claim.id).order_by(ClaimStatusHistory.created_at).all()
                for entry in history_entries:
                    tracking_history.append({
                        "status": entry.status.capitalize(),
                        "timestamp": entry.created_at.isoformat() + "Z",
                        "notes": entry.notes
                    })

                # Handle incident_date - could be datetime or string
                incident_date_str = None
                if claim.incident_date:
                    if isinstance(claim.incident_date, str):
                        # If it's already a string, use it directly
                        incident_date_str = claim.incident_date
                    else:
                        # If it's a datetime object, format it
                        incident_date_str = claim.incident_date.isoformat()

                # Get documents for this claim
                documents = []
                for doc in claim.documents:
                    documents.append({
                        "id": doc.id,
                        "file_name": doc.file_name,
                        "document_type": doc.document_type,
                        "uploaded_at": doc.uploaded_at.isoformat() + "Z" if doc.uploaded_at else None
                    })

                claims_data.append({
                    "claim_id": claim.id,
                    "policy_name": claim.user_policy.policy.name if claim.user_policy.policy else "Unknown Policy",
                    "amount_claimed": claim.amount_claimed,
                    "status": claim.status,
                    "created_at": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                    "tracking_history": tracking_history
                })

            return claims_data
        finally:
            db.close()
    except Exception as e:
        print(f"Error fetching user claims: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch claims")

@router.post("/api/claims")
async def submit_claim(
    request: Request,
    insurance_type: str = Form(...),
    claim_type: str = Form(...),
    claim_amount: str = Form(...),
    incident_date: str = Form(...),
    incident_type: str = Form(...),
    description: Optional[str] = Form(None),
    documents: List[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Get user ID from token
        user_id = current_user.get('user_id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        # Find an active policy for this user (for simplicity, use the first active policy)
        db = SessionLocal()
        claim_id = None
        claim_number = None
        submitted_at = None
        try:
            user_policy = db.query(UserPolicy).filter_by(user_id=user_id, status='active').first()
            if not user_policy:
                raise HTTPException(status_code=400, detail="No active policy found for user")

            # Generate unique claim number
            claim_number = f"CLM{random.randint(100000, 999999)}"

            # Parse incident date
            try:
                parsed_incident_date = datetime.strptime(incident_date.strip(), '%Y-%m-%d')
                # Ensure it's a naive datetime (no timezone)
                parsed_incident_date = parsed_incident_date.replace(tzinfo=None)
            except ValueError as date_error:
                raise HTTPException(status_code=400, detail=f"Invalid incident date format: {incident_date}. Expected YYYY-MM-DD")

            # Create new claim
            new_claim = Claim(
                user_policy_id=user_policy.id,
                claim_number=claim_number,
                claim_type=claim_type,
                incident_date=parsed_incident_date,
                amount_claimed=float(claim_amount),
                description=description,
                status='submitted'
            )

            db.add(new_claim)
            db.commit()

            # Store values before potential session issues
            claim_id = new_claim.id
            submitted_at = new_claim.created_at.isoformat() if new_claim.created_at else None

            # Create initial status history
            initial_history = ClaimStatusHistory(
                claim_id=new_claim.id,
                status='submitted',
                notes='Claim submitted successfully'
            )
            db.add(initial_history)
            db.commit()

            # Handle file uploads
            saved_files = []
            if documents:
                for file in documents:
                    if file and file.filename:
                        filename = secure_filename(file.filename)
                        filepath = os.path.join("uploads", filename)
                        os.makedirs("uploads", exist_ok=True)
                        with open(filepath, "wb") as buffer:
                            content = await file.read()
                            buffer.write(content)

                        # Create ClaimDocument record in database
                        doc = ClaimDocument(
                            claim_id=new_claim.id,
                            document_type="supporting",
                            file_name=filename,
                            s3_key=filepath  # Store local path as s3_key for now
                        )
                        db.add(doc)
                        saved_files.append(filename)

            db.commit()  # Commit document records
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

        # Send email notification (simplified for FastAPI)
        try:
            # Get user email from database
            db_email = SessionLocal()
            try:
                user = db_email.query(User).get(user_id)
                if user and user.email:
                    # For now, just log the email - email sending would need to be implemented
                    print(f"Claim notification email would be sent to {user.email}")
            finally:
                db_email.close()
        except Exception as email_error:
            print(f"Failed to send email notification: {email_error}")
            # Don't fail the claim submission if email fails

        # Response
        return {
            "message": "Claim submitted successfully",
            "data": {
                "claim_id": claim_id,
                "claim_number": claim_number,
                "insurance_type": insurance_type,
                "claim_type": claim_type,
                "claim_amount": claim_amount,
                "incident_date": incident_date,
                "incident_type": incident_type,
                "description": description,
                "documents": saved_files,
                "submitted_at": submitted_at
            }
        }

    except Exception as e:
        import traceback
        print(f"Error submitting claim: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to submit claim: {str(e)}")

@router.get("/api/claims/{claim_id}")
async def get_single_claim(claim_id: int, current_user: dict = Depends(get_current_user)):
    try:
        # Get user ID from token
        user_id = current_user.get('user_id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        db = SessionLocal()
        try:
            # Query the specific claim for this user
            claim = db.query(Claim).join(UserPolicy).filter(
                Claim.id == claim_id,
                UserPolicy.user_id == user_id
            ).first()

            if not claim:
                raise HTTPException(status_code=404, detail="Claim not found")

            # Get tracking history from database
            tracking_history = []
            history_entries = db.query(ClaimStatusHistory).filter_by(claim_id=claim_id).order_by(ClaimStatusHistory.created_at).all()

            # Define the status flow
            status_flow = ['submitted', 'processing', 'approved', 'rejected']
            status_index = {status: i for i, status in enumerate(status_flow)}

            # Add history entries
            for entry in history_entries:
                step_index = status_index.get(entry.status.lower(), -1)
                tracking_history.append({
                    "step": entry.status.capitalize(),
                    "date": entry.created_at.isoformat() + "Z",
                    "completed": True,
                    "notes": entry.notes
                })

            # Add current status if not in history
            current_status_lower = claim.status.lower()
            if not any(h['step'].lower() == current_status_lower for h in tracking_history):
                tracking_history.append({
                    "step": claim.status.capitalize(),
                    "date": claim.updated_at.isoformat() + "Z" if claim.updated_at else claim.created_at.isoformat() + "Z",
                    "completed": current_status_lower in ['approved', 'rejected'],
                    "notes": f"Claim is currently {claim.status}"
                })

            # Sort by date
            tracking_history.sort(key=lambda x: x['date'])

            # Get documents
            documents = []
            for doc in claim.documents:
                documents.append({
                    "id": doc.id,
                    "file_name": doc.file_name,
                    "document_type": doc.document_type,
                    "uploaded_at": doc.uploaded_at.isoformat() + "Z" if doc.uploaded_at else None
                })

            claim_data = {
                "id": claim.id,
                "policy_id": f"POL-{claim.user_policy_id}",
                "insurance_type": claim.user_policy.policy.type if claim.user_policy.policy else "Unknown",
                "claim_type": claim.claim_type,
                "claim_amount": claim.amount_claimed,
                "incident_date": claim.incident_date.isoformat() if claim.incident_date else None,
                "incident_type": claim.claim_type,
                "description": claim.description or "No description provided",
                "status": claim.status,
                "created_at": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                "updated_at": claim.updated_at.isoformat() + "Z" if claim.updated_at else None,
                "documents": documents,
                "tracking_history": tracking_history
            }

            return claim_data
        finally:
            db.close()
    except Exception as e:
        print(f"Error fetching claim {claim_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch claim")

@router.put("/api/claims/{claim_id}/status")
async def update_claim_status(claim_id: int, status: str, current_user: dict = Depends(admin_required)):
    try:
        db = SessionLocal()
        try:
            claim = db.query(Claim).get(claim_id)
            if not claim:
                raise HTTPException(status_code=404, detail="Claim not found")

            claim.status = status
            db.commit()

            user_email = claim.user_policy.user.email
            claim_no = claim.claim_number

            # Trigger Celery
            send_claim_email.delay(user_email, status, claim_no)

            return {"message": "Status Updated"}
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update claim status")
