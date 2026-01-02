from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import random

# ✅ FIXED IMPORTS
from app.extensions import db
from app.modules.claims.models import Claim, ClaimDocument, FraudFlag
from app.modules.policies.models import UserPolicy
from app.modules.auth.models import Notification, User
from app.modules.fraud.engine import run_fraud_checks

claims_bp = Blueprint('claims', __name__)
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@claims_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_claim():
    try:
        user_id = get_jwt_identity()
        policy_id = request.form.get('policy_id')
        incident_date_str = request.form.get('incident_date')
        desc = request.form.get('description', '').strip()
        amount_str = request.form.get('claim_amount')
        file = request.files.get('proof_file')

        if not all([policy_id, incident_date_str, desc, amount_str]):
            return jsonify({"message": "Missing fields"}), 400

        user_policy = UserPolicy.query.filter_by(id=policy_id, user_id=user_id).first()
        if not user_policy: return jsonify({"message": "Invalid Policy"}), 400

        claim = Claim(
            user_policy_id=user_policy.id,
            claim_number=f"CLM-{random.randint(1000,9999)}",
            incident_date=datetime.strptime(incident_date_str, '%Y-%m-%d').date(),
            incident_description=desc,
            claim_amount=float(amount_str),
            status='Submitted',
            claim_type=user_policy.policy.policy_type
        )
        db.session.add(claim)
        db.session.flush()

        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"{claim.claim_number}_{file.filename}")
            upload_folder = os.path.join(current_app.instance_path, 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            save_path = os.path.join(upload_folder, filename)
            file.save(save_path)

            doc = ClaimDocument(claim_id=claim.id, file_name=filename, file_path=save_path, document_type=file.mimetype)
            db.session.add(doc)
            
            dup = ClaimDocument.query.join(Claim).join(UserPolicy).filter(
                UserPolicy.user_id == user_id,
                ClaimDocument.file_name == file.filename,
                ClaimDocument.claim_id != claim.id
            ).first()
            if dup:
                db.session.add(FraudFlag(claim_id=claim.id, rule_code='DUPLICATE_EVIDENCE', severity='medium', details=f"File {file.filename} used before"))

        db.session.commit()
        run_fraud_checks(claim)
        db.session.add(Notification(user_id=user_id, title="Claim Received", message=f"Claim #{claim.claim_number} received."))
        db.session.commit()
        return jsonify({"message": "Submitted", "claim_number": claim.claim_number}), 201

    except Exception as e:
        return jsonify({"message": str(e)}), 500

@claims_bp.route('/document/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_claim_document(doc_id):
    doc = ClaimDocument.query.get(doc_id)
    if not doc: return jsonify({"message": "Not found"}), 404
    
    claim = Claim.query.get(doc.claim_id)
    user = User.query.get(get_jwt_identity())
    
    if claim.user_policy.user_id != user.id and not user.is_admin:
        return jsonify({"message": "Unauthorized"}), 403

    if os.path.exists(doc.file_path):
        return send_file(doc.file_path)
    return jsonify({"message": "File missing"}), 404