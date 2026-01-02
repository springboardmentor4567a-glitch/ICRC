# Quick Setup Guide for insurez_db

## Your Database Information

- **Database Name:** insurez_db
- **Username:** postgres
- **Password:** Dinesh@099
- **Host:** localhost
- **Port:** 5432

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database Tables

```bash
python setup_db.py
```

This will create the necessary tables in your existing `insurez_db` database.

### 3. Start Backend Server

```bash
python run.py
```

Expected output:

```
✓ Database tables initialized successfully
 * Running on http://127.0.0.1:5000
```

### 4. Start Frontend (in new terminal)

```bash
npm start
```

## Testing the Setup

1. Open http://localhost:3000
2. Click "Register here"
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click "Create Account"
5. Should see: "Register successful"

## If setup_db.py Still Fails

Check these things:

1. **PostgreSQL Running:**

   - Open pgAdmin or Command Prompt
   - Run: `psql -U postgres -h localhost`
   - You should be able to connect with password: `Dinesh@099`

2. **Database Exists:**

   - In pgAdmin, you should see `insurez_db` under Databases
   - Or in psql: `\l` (lists all databases)

3. **Python Environment:**

   - Make sure you're in the backend directory
   - Run: `pip list` to verify psycopg2-binary is installed

4. **View Error Details:**
   - Check the error message carefully
   - Copy-paste the exact error for troubleshooting

## Database Tables Created

After running setup_db.py, you'll have:

```
users table:
- id (Primary Key)
- name (String)
- email (String, Unique)
- password (String - hashed with bcrypt)
- dob (Date, optional)
- created_at (DateTime)
```

All user registrations will be stored here automatically!
