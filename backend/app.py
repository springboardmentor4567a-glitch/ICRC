from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
import jwt
from functools import wraps
from dotenv import load_dotenv
from models import db, Claim, ClaimDocument, ClaimStatusHistory, UserPolicy, User, Policy

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

# ===============================
# CONFIG
# ===============================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB
app.config["SECRET_KEY"] = "demo-secret"  # JWT secret key
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///training_db.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Email configuration from environment variables
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_TLS", "True").lower() == "true"
app.config["MAIL_USE_SSL"] = os.getenv("MAIL_SSL", "False").lower() == "true"
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_FROM")

# Initialize Flask-Mail
mail = Mail(app)

# Initialize database
db.init_app(app)

# Create all tables
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        # If tables already exist, just continue
        pass

# ===============================
# ENABLE CORS (IMPORTANT)
# ===============================
CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(app, resources={r"/policies": {"origins": "*"}})

# ===============================
# AUTHENTICATION DECORATOR
# ===============================
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

# ===============================
# CLAIM API
# ===============================
@app.route("/api/claims", methods=["GET"])
def get_claims():
    try:
        # Query all claims from database with explicit joins
        claims = Claim.query.join(UserPolicy, Claim.user_policy_id == UserPolicy.id)\
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

        return jsonify(claims_data)
    except Exception as e:
        print(f"Error fetching claims: {e}")
        return jsonify({"error": "Failed to fetch claims"}), 500

@app.route("/api/user/claims", methods=["GET"])
@token_required
def get_user_claims(current_user):
    try:
        # Get user ID from token
        user_id = current_user.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID not found in token"}), 400

        print(f"Fetching claims for user_id: {user_id}")

        # Get user policy IDs for this user
        user_policy_ids = [up.id for up in UserPolicy.query.filter_by(user_id=user_id).all()]
        print(f"User policy IDs for user {user_id}: {user_policy_ids}")

        # Query claims for this user using policy IDs
        user_claims = Claim.query.join(UserPolicy).join(Policy).filter(Claim.user_policy_id.in_(user_policy_ids)).all()
        print(f"Found {len(user_claims)} claims for user {user_id}")

        claims_data = []
        for claim in user_claims:
            # Get tracking history from database
            tracking_history = []
            history_entries = ClaimStatusHistory.query.filter_by(claim_id=claim.id).order_by(ClaimStatusHistory.created_at).all()
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

        return jsonify(claims_data)
    except Exception as e:
        print(f"Error fetching user claims: {e}")
        return jsonify({"error": "Failed to fetch claims"}), 500

@app.route("/api/claims", methods=["POST", "OPTIONS"])
@token_required
def submit_claim(current_user):
    # Handle preflight request
    if request.method == "OPTIONS":
        return "", 200

    try:
        # -------- FORM DATA --------
        insurance_type = request.form.get("insurance_type")
        claim_type = request.form.get("claim_type")
        claim_amount = request.form.get("claim_amount")
        incident_date = request.form.get("incident_date")
        incident_type = request.form.get("incident_type")
        description = request.form.get("description")

        if not insurance_type or not claim_type or not claim_amount or not incident_date:
            return jsonify({"error": "Missing required fields"}), 400

        # Get user ID from token
        user_id = current_user.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID not found in token"}), 400

        # Find an active policy for this user (for simplicity, use the first active policy)
        user_policy = UserPolicy.query.filter_by(user_id=user_id, status='active').first()
        if not user_policy:
            return jsonify({"error": "No active policy found for user"}), 400

        # Generate unique claim number
        import random
        claim_number = f"CLM{random.randint(100000, 999999)}"

        # Parse incident date
        try:
            parsed_incident_date = datetime.strptime(incident_date.strip(), '%Y-%m-%d')
            # Ensure it's a naive datetime (no timezone)
            parsed_incident_date = parsed_incident_date.replace(tzinfo=None)
        except ValueError as date_error:
            return jsonify({"error": f"Invalid incident date format: {incident_date}. Expected YYYY-MM-DD"}), 400

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

        db.session.add(new_claim)
        db.session.commit()

        # Create initial status history with progression
        status_progression = [
            ('submitted', 'Claim submitted successfully'),
            ('under review', 'Claim is being reviewed by our team'),
        ]

        for status, notes in status_progression:
            history_entry = ClaimStatusHistory(
                claim_id=new_claim.id,
                status=status,
                notes=notes
            )
            db.session.add(history_entry)

        # Update claim status to 'under review'
        new_claim.status = 'under review'
        new_claim.updated_at = datetime.utcnow()

        db.session.commit()

        # -------- FILE UPLOAD --------
        uploaded_files = request.files.getlist("documents")

        saved_files = []
        for file in uploaded_files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)

                # Create ClaimDocument record in database
                doc = ClaimDocument(
                    claim_id=new_claim.id,
                    document_type="supporting",
                    file_name=filename,
                    s3_key=filepath  # Store local path as s3_key for now
                )
                db.session.add(doc)
                saved_files.append(filename)

        db.session.commit()  # Commit document records

        # -------- SEND EMAIL NOTIFICATION --------
        try:
            # Get user email from database
            user = User.query.get(user_id)
            if user and user.email:
                # Create email message
                msg = Message(
                    subject=f"Claim Submitted Successfully - {claim_number}",
                    recipients=[user.email],
                    html=f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333; text-align: center;">Claim Submission Confirmation</h2>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #28a745; margin-top: 0;">✅ Claim Submitted Successfully</h3>

                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; width: 150px;">Claim Number:</td>
                                    <td style="padding: 8px 0;">{claim_number}</td>
                                </tr>
                                <tr style="background-color: #fff;">
                                    <td style="padding: 8px 0; font-weight: bold;">Insurance Type:</td>
                                    <td style="padding: 8px 0;">{insurance_type}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Claim Type:</td>
                                    <td style="padding: 8px 0;">{claim_type}</td>
                                </tr>
                                <tr style="background-color: #fff;">
                                    <td style="padding: 8px 0; font-weight: bold;">Claim Amount:</td>
                                    <td style="padding: 8px 0;">₹{claim_amount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Incident Date:</td>
                                    <td style="padding: 8px 0;">{incident_date}</td>
                                </tr>
                                <tr style="background-color: #fff;">
                                    <td style="padding: 8px 0; font-weight: bold;">Submitted Date:</td>
                                    <td style="padding: 8px 0;">{new_claim.created_at.strftime('%Y-%m-%d %H:%M:%S')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                                    <td style="padding: 8px 0; color: #007bff;">Under Review</td>
                                </tr>
                            </table>

                            {f'<p style="margin-top: 20px;"><strong>Description:</strong> {description}</p>' if description else ''}

                            {f'<p style="margin-top: 10px;"><strong>Documents Submitted:</strong> {", ".join(saved_files)}</p>' if saved_files else ''}
                        </div>

                        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #495057;">What happens next?</h4>
                            <ul style="color: #6c757d; margin: 10px 0;">
                                <li>Our claims team will review your submission within 2-3 business days</li>
                                <li>You may be contacted for additional information if needed</li>
                                <li>You can track your claim status in your dashboard</li>
                                <li>Processing time varies based on claim complexity</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Claim Details</a>
                        </div>

                        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 12px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                            <p>If you have any questions, please contact our support team.</p>
                            <p>&copy; 2024 Insurance Company. All rights reserved.</p>
                        </div>
                    </div>
                    """
                )
                mail.send(msg)
                print(f"Claim notification email sent to {user.email}")
        except Exception as email_error:
            print(f"Failed to send email notification: {email_error}")
            # Don't fail the claim submission if email fails

        # -------- RESPONSE --------
        return jsonify({
            "message": "Claim submitted successfully",
            "data": {
                "claim_id": new_claim.id,
                "claim_number": claim_number,
                "insurance_type": insurance_type,
                "claim_type": claim_type,
                "claim_amount": claim_amount,
                "incident_date": incident_date,
                "incident_type": incident_type,
                "description": description,
                "documents": saved_files,
                "submitted_at": new_claim.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error submitting claim: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Failed to submit claim: {str(e)}"}), 500


# ===============================
# LOGIN ENDPOINT
# ===============================
@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    # Handle preflight request
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        # First check if it's an admin login attempt
        if email == "admin@admin.com":
            # Check admin user in database
            user = User.query.filter_by(email=email, role="admin").first()
            if user and user.check_password(password):
                # Generate JWT token
                token_payload = {
                    "user_id": user.id,
                    "email": user.email,
                    "role": user.role
                }
                access_token = jwt.encode(token_payload, app.config["SECRET_KEY"], algorithm="HS256")

                return jsonify({
                    "message": "Login Successful",
                    "accessToken": access_token,
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "role": user.role
                    }
                })
            else:
                return jsonify({"message": "Invalid admin credentials"}), 401
        else:
            # Regular user login
            user = User.query.filter_by(email=email).first()
            if not user:
                # Create a new user
                user = User(
                    name="Regular User",
                    email=email,
                    phone="1234567890"
                )
                user.set_password(password)
                db.session.add(user)
                db.session.commit()

                # Create a sample user policy for the new user
                sample_policy = Policy.query.first()
                if sample_policy:
                    user_policy = UserPolicy(
                        user_id=user.id,
                        policy_id=sample_policy.id,
                        purchase_date=datetime.utcnow(),
                        start_date=datetime.utcnow().date(),
                        end_date=(datetime.utcnow() + timedelta(days=365)).date(),
                        premium_amount=sample_policy.base_premium,
                        coverage_amount=500000,
                        status='active'
                    )
                    db.session.add(user_policy)
                    db.session.commit()

            elif not user.check_password(password):
                return jsonify({"message": "Invalid credentials"}), 401

            # Generate JWT token
            token_payload = {
                "user_id": user.id,
                "email": user.email,
                "role": user.role
            }
            access_token = jwt.encode(token_payload, app.config["SECRET_KEY"], algorithm="HS256")

            return jsonify({
                "message": "Login Successful",
                "accessToken": access_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role
                }
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# POLICIES ENDPOINT (SAMPLE DATA)
# ===============================
@app.route("/policies", methods=["GET"])
def get_policies():
    # Return sample policies since we simplified the backend
    policies = [
        {
            'id': 1,
            'name': "Comprehensive Health Insurance",
            'category': "Health",
            'provider': "HealthCorp",
            'coverage': {"hospitalization": 1000000, "day_care": 50000},
            'base_premium': 5000,
            'rating': 4.5,
            'features': ["Hospitalization", "Day Care", "Ambulance"],
            'term_months': 12,
            'deductible': 0,
            'description': "Complete health coverage for individuals and families"
        },
        {
            'id': 2,
            'name': "Term Life Insurance",
            'category': "Life",
            'provider': "LifeSecure",
            'coverage': {"death_benefit": 5000000},
            'base_premium': 3000,
            'rating': 4.2,
            'features': ["Death Benefit", "Terminal Illness", "Accidental Death"],
            'term_months': 240,
            'deductible': 0,
            'description': "Affordable life insurance for long-term protection"
        },
        {
            'id': 3,
            'name': "Car Insurance",
            'category': "Auto",
            'provider': "AutoGuard",
            'coverage': {"third_party": 2000000, "own_damage": 1000000},
            'base_premium': 4000,
            'rating': 4.0,
            'features': ["Third Party Liability", "Own Damage", "Theft"],
            'term_months': 12,
            'deductible': 0,
            'description': "Comprehensive auto insurance coverage"
        },
        {
            'id': 4,
            'name': "Home Insurance",
            'category': "Property",
            'provider': "HomeSafe",
            'coverage': {"structure": 3000000, "contents": 1000000},
            'base_premium': 6000,
            'rating': 4.3,
            'features': ["Structure", "Contents", "Burglary"],
            'term_months': 12,
            'deductible': 0,
            'description': "Protect your home and belongings"
        }
    ]
    return jsonify(policies)

# ===============================
# ADMIN DASHBOARD ANALYTICS
# ===============================
@app.route("/api/analytics/dashboard", methods=["GET"])
@token_required
def get_dashboard_analytics(current_user):
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    try:
        # Query all claims from database
        claims = Claim.query.all()
        total_claims = len(claims)
        pending_claims = len([c for c in claims if c.status == 'pending'])
        approved_claims = len([c for c in claims if c.status == 'approved'])
        rejected_claims = len([c for c in claims if c.status == 'rejected'])
        total_claim_amount = sum(c.amount_claimed for c in claims)

        # Calculate claims by type
        claims_by_type = {}
        for claim in claims:
            claim_type = claim.claim_type
            claims_by_type[claim_type] = claims_by_type.get(claim_type, 0) + 1

        # Calculate fraud flags (claims with fraud_score > 0.7)
        fraud_flags = len([c for c in claims if c.fraud_score > 0.7])

        # Get recent activity from claims (last 3 updated)
        recent_activity = []
        sorted_claims = sorted(claims, key=lambda x: x.created_at, reverse=True)
        for claim in sorted_claims[:3]:
            action = f"Claim {claim.status}"
            recent_activity.append({
                "action": action,
                "timestamp": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                "user": f"User {claim.user_policy.user.id}"
            })

        # Query users and policies for dynamic counts
        total_users = User.query.count()
        active_policies = UserPolicy.query.filter_by(status='active').count()

        # Query policies by category
        policies_by_category = {}
        policies = Policy.query.all()
        for policy in policies:
            category = policy.category
            policies_by_category[category] = policies_by_category.get(category, 0) + 1

        analytics = {
            "total_users": total_users,
            "active_policies": active_policies,
            "total_claims": total_claims,
            "pending_claims": pending_claims,
            "approved_claims": approved_claims,
            "rejected_claims": rejected_claims,
            "total_premiums": total_claim_amount,
            "monthly_revenue": total_claim_amount // 12 if total_claim_amount > 0 else 0,
            "claims_by_type": claims_by_type,
            "policies_by_category": policies_by_category,
            "fraud_flags": fraud_flags,
            "recent_activity": recent_activity
        }
        return jsonify(analytics)
    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return jsonify({"error": "Failed to fetch analytics"}), 500

# ===============================
# ADMIN CLAIMS MANAGEMENT
# ===============================
# Global claims data for demo
claims_data = [
    {
        "id": 1,
        "user_id": 101,
        "claim_number": "CLM123456",
        "claim_type": "Medical",
        "amount_claimed": 50000,
        "status": "pending",
        "fraud_score": 0.15,
        "created_at": "2024-01-15T10:30:00Z",
        "incident_date": "2024-01-10"
    },
    {
        "id": 2,
        "user_id": 102,
        "claim_number": "CLM123457",
        "claim_type": "Vehicle Damage",
        "amount_claimed": 75000,
        "status": "approved",
        "fraud_score": 0.05,
        "created_at": "2024-01-14T14:20:00Z",
        "incident_date": "2024-01-08"
    },
    {
        "id": 3,
        "user_id": 103,
        "claim_number": "CLM123458",
        "claim_type": "Property Loss",
        "amount_claimed": 100000,
        "status": "rejected",
        "fraud_score": 0.85,
        "created_at": "2024-01-13T09:15:00Z",
        "incident_date": "2024-01-05"
    },
    {
        "id": 4,
        "user_id": 104,
        "claim_number": "CLM123459",
        "claim_type": "Life Insurance",
        "amount_claimed": 200000,
        "status": "pending",
        "fraud_score": 0.22,
        "created_at": "2024-01-12T16:45:00Z",
        "incident_date": "2024-01-07"
    },
    {
        "id": 5,
        "user_id": 105,
        "claim_number": "CLM123460",
        "claim_type": "Health Emergency",
        "amount_claimed": 35000,
        "status": "approved",
        "fraud_score": 0.08,
        "created_at": "2024-01-11T11:30:00Z",
        "incident_date": "2024-01-06"
    }
]

@app.route("/api/admin/claims", methods=["GET"])
@token_required
@admin_required
def get_all_claims(current_user):
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
                "description": claim.description,
                "amount_claimed": claim.amount_claimed,
                "status": claim.status,
                "fraud_score": claim.fraud_score,
                "created_at": claim.created_at.isoformat() + "Z" if claim.created_at else None,
                "incident_date": claim.incident_date.isoformat() if claim.incident_date else None
            })

        return jsonify(claims_data)
    except Exception as e:
        print(f"Error fetching claims: {e}")
        return jsonify({"error": "Failed to fetch claims"}), 500

@app.route("/api/claims/<int:claim_id>", methods=["GET"])
@token_required
def get_single_claim(current_user, claim_id):
    try:
        # Get user ID from token
        user_id = current_user.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID not found in token"}), 400

        # Query the specific claim for this user
        claim = Claim.query.join(UserPolicy).filter(
            Claim.id == claim_id,
            UserPolicy.user_id == user_id
        ).first()

        if not claim:
            return jsonify({"error": "Claim not found"}), 404

        # Get tracking history from database
        tracking_history = []
        history_entries = ClaimStatusHistory.query.filter_by(claim_id=claim_id).order_by(ClaimStatusHistory.created_at).all()

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

        return jsonify(claim_data)
    except Exception as e:
        print(f"Error fetching claim {claim_id}: {e}")
        return jsonify({"error": "Failed to fetch claim"}), 500

@app.route("/api/admin/claims/<int:id>/status", methods=["PUT"])
@token_required
@admin_required
def update_claim_status(current_user, id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["approved", "rejected", "processing", "submitted", "under review"]:
        return jsonify({"message": "Invalid status"}), 400

    try:
        # Find and update the claim in database
        claim = Claim.query.get(id)
        if not claim:
            return jsonify({"message": "Claim not found"}), 404

        # Only create history entry if status actually changed
        if claim.status != status:
            # Create detailed status history based on the new status
            status_notes = {
                "under review": "Claim is being reviewed by our claims team",
                "processing": "Claim is being processed for payment",
                "approved": "Claim has been approved and payment will be processed",
                "rejected": "Claim has been reviewed and unfortunately rejected"
            }

            history_entry = ClaimStatusHistory(
                claim_id=claim.id,
                status=status,
                notes=status_notes.get(status, f"Status updated to {status} by admin")
            )
            db.session.add(history_entry)

        claim.status = status
        claim.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({"message": f"Claim {status}"})
    except Exception as e:
        db.session.rollback()
        print(f"Error updating claim status: {e}")
        return jsonify({"error": "Failed to update claim status"}), 500

# ===============================
# START SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
