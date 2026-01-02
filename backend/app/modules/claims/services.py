from app.extensions import db
from .models import Claim, ClaimDocument, FraudFlag
from app.modules.policies.models import UserPolicy
from app.modules.auth.models import Notification, User
from app.modules.fraud.engine import run_fraud_checks
from werkzeug.utils import secure_filename
from datetime import datetime
import os, random

class ClaimService:
    @staticmethod
    def submit_claim(user_id, form, file, upload_folder):
        up = UserPolicy.query.filter_by(id=form['policy_id'], user_id=user_id).first()
        if not up: raise ValueError("Invalid Policy")

        # 1. Create Claim
        claim = Claim(
            user_policy_id=up.id,
            claim_number=f"CLM-{random.randint(1000,9999)}",
            incident_date=datetime.strptime(form['incident_date'], '%Y-%m-%d').date(),
            incident_description=form['description'],
            claim_amount=float(form['claim_amount']),
            status='Submitted',
            claim_type=up.policy.policy_type
        )
        db.session.add(claim)
        db.session.flush() # Generate ID

        # 2. Handle File & Check for Duplicate Evidence
        if file:
            fname = secure_filename(f"{claim.claim_number}_{file.filename}")
            path = os.path.join(upload_folder, fname)
            file.save(path)
            
            # Save Document Record
            doc = ClaimDocument(claim_id=claim.id, file_name=fname, file_path=path)
            db.session.add(doc)
            
            # 🚨 FRAUD CHECK: Duplicate Evidence
            # Check if this filename was used in a previous claim by this user
            dup = ClaimDocument.query.join(Claim).join(UserPolicy).filter(
                UserPolicy.user_id == user_id,
                ClaimDocument.file_name == file.filename, # Checking original name
                ClaimDocument.claim_id != claim.id
            ).first()
            
            if dup:
                db.session.add(FraudFlag(
                    claim_id=claim.id, 
                    rule_code='DUPLICATE_EVIDENCE', 
                    severity='medium', 
                    details=f"File {file.filename} was used in a previous claim."
                ))
        
        db.session.commit()
        
        # 3. Run AI Fraud Engine
        run_fraud_checks(claim)
        
        # 4. Notify
        db.session.add(Notification(user_id=user_id, title="Claim Received", message=f"Claim {claim.claim_number} received."))
        db.session.commit()
        
        return claim

    @staticmethod
    def get_document(doc_id, user_id):
        """Securely retrieves document path for downloading"""
        doc = ClaimDocument.query.get(doc_id)
        if not doc: raise ValueError("Document not found")
        
        claim = Claim.query.get(doc.claim_id)
        user = User.query.get(user_id)

        # Authorization: Only the owner OR an Admin can view
        if claim.user_policy.user_id != user_id and not user.is_admin:
            raise ValueError("Unauthorized access to document")

        return doc.file_path