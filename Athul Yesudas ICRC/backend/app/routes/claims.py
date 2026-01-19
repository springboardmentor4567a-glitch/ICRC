from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from ..models import db, UserPolicy, Claim, ClaimDocument, Notification

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/my-policies', methods=['GET'])
@jwt_required()
def get_my_policies():
    try:
        user_id = get_jwt_identity()
        policies = UserPolicy.query.filter_by(user_id=user_id).all()
        
        result = []
        for p in policies:
            result.append({
                "id": p.id,
                "policy_id": p.policy_id,
                "title": p.policy.title,
                "policy_number": p.policy_number,
                "coverage_amount": p.coverage_amount,
                "remaining_balance": p.remaining_sum_insured, 
                "status": p.status,
                "end_date": p.end_date.strftime('%Y-%m-%d')
            })
            
        return jsonify(result), 200
    except Exception as e:
        print(f"My Policies Error: {e}")
        return jsonify([]), 200

@claims_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_claim():
    try:
        user_id = get_jwt_identity()
        
        policy_id = request.form.get('policy_id')
        incident_date_str = request.form.get('incident_date')
        desc = request.form.get('description')
        amount_str = request.form.get('claim_amount')
        file = request.files.get('proof_file')

        if not all([policy_id, incident_date_str, desc, amount_str]):
            return jsonify({"message": "Missing fields"}), 400

        try:
            amount = float(amount_str)
        except ValueError:
            return jsonify({"message": "Invalid amount"}), 400

        user_policy = UserPolicy.query.filter_by(id=policy_id, user_id=user_id).first()
        if not user_policy:
            return jsonify({"message": "Invalid Policy"}), 400

        # Generate Claim Number
        import random
        claim_num = f"CLM-{random.randint(1000,9999)}"
        incident_date = datetime.strptime(incident_date_str, '%Y-%m-%d')

        new_claim = Claim(
            user_policy_id=user_policy.id,
            claim_number=claim_num,
            incident_date=incident_date,
            incident_description=desc,
            claim_amount=amount,
            status='Submitted'
        )
        db.session.add(new_claim)
        db.session.flush()

        # Handle File
        if file:
            filename = secure_filename(file.filename)
            upload_folder = os.path.join('app', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            save_path = os.path.join(upload_folder, filename)
            file.save(save_path)
            
            doc = ClaimDocument(
                claim_id=new_claim.id,
                file_name=filename,
                file_path=save_path,
                document_type=file.content_type
            )
            db.session.add(doc)

        # ✅ NEW: Create Notification for Inbox
        notif = Notification(
            user_id=user_id,
            title="Claim Submitted",
            message=f"Claim #{claim_num} for ₹{amount:,.2f} has been submitted under {user_policy.policy.title}."
        )
        db.session.add(notif)

        db.session.commit()
        return jsonify({"message": "Claim submitted successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Claim Error: {e}")
        return jsonify({"message": f"Error: {str(e)}"}), 500