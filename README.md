# ICRA - Insurance Comparison, Recommendation & Claim Assistant
ICRA is a full-stack web application designed to simplify insurance management. It allows users to browse policies, receive personalized AI recommendations based on risk profiles, calculate financial goals, and file claims seamlessly.
The platform includes a robust **Admin Dashboard** with automated **Fraud Detection**, **Audit Logging**, and **Live Market Simulation**.

---
## Key Features
* **Smart Recommendation Engine:** Suggests policies based on user BMI, income, and risk profile.
* **Policy Marketplace:** Compare Health, Life, Auto, and Travel insurance with live-simulated premiums.
* **Claims & Fraud Detection:** Users can upload evidence files; the system runs background fraud checks (e.g., suspicious timing or amounts).
* **Interactive Chatbot:** A state-aware assistant for policy queries, finding hospitals, and financial calculations (EMI, Tax, BMI).
* **Admin Dashboard:** Real-time analytics, user management, claim approval/rejection, and audit logs.
* **Tools:** PDF Invoice generation, Tax Savers, and Financial Calculators.

---
## Tech Stack
| Component | Technology Used |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide React (Icons) |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite / PostgreSQL (via SQLAlchemy) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Async Tasks** | FastAPI BackgroundTasks (Email & Fraud Checks) |
| **Reporting** | FPDF (Python) for PDF Invoice Generation |

---
## Installation & Setup
Follow these steps to run the project locally.

### 1. Backend Setup
Navigate to the root directory and set up the Python environment.

```bash
# 1. Create a virtual environment
python3 -m venv venv

# 2. Activate the environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install ALL dependencies
pip install fastapi uvicorn sqlalchemy python-multipart aiofiles python-jose[cryptography] passlib[bcrypt] fpdf slowapi pytest httpx

# 4. Run the Server
uvicorn main:app --reload
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend folder.

```bash
# Navigate to frontend (adjust folder name if different)
cd frontend

# Install Node modules
npm install

# Start the React App
npm run dev
```

How to Run Tests
To verify that the backend API, Authentication, and Admin security are working correctly, run the automated test suite:

```bash
# Make sure your virtual environment is active
pytest
```

### Project Structure

```bash
ICRA-Project/
├── backend/
│   ├── main.py           # API Routes & Logic
│   ├── models.py         # Database Schema
│   ├── schemas.py        # Pydantic Models
│   ├── database.py       # DB Connection
│   ├── fraud_engine.py   # Fraud Detection Rules
│   ├── utils.py          # PDF Generation & File Handling
│   └── static/uploads/   # Stored Evidence & Invoices
├── frontend/
│   ├── src/
│   │   ├── components/   # Chatbot, Navbar, Modals
│   │   ├── pages/        # Dashboard, Admin, Policies
│   │   └── App.jsx       # Main Routing Logic
│   └── package.json
└── README.md
```

### Credentials
Admin Login : Email : admin@icra.com - Password: Admin@123
User Login : You can Register a new user.


