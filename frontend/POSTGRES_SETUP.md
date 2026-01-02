## Step 1: Install Required Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs `psycopg2-binary` which is needed for PostgreSQL connection.

## Step 2: Verify PostgreSQL is Running

**On Windows:**

- Open Services (services.msc) or
- PostgreSQL should be running as a Windows service (postgresql-x64-XX)

**Check connection:**

```bash
psql -U postgres -h localhost
```

When prompted, enter password: `Dinesh@099`

## Step 3: Create Database

Run the automated setup script:

```bash
cd backend
python setup_db.py
```

This will:

1. Create the `project_infosys` database
2. Create all necessary tables (users, etc.)

## Step 4: Start Backend Server

```bash
cd backend
python run.py
```

You should see:

```
✓ Database tables initialized successfully
 * Running on http://127.0.0.1:5000
```

## Step 5: Start Frontend

In a new terminal:

```bash
npm start
```

## Troubleshooting

### Error: "could not connect to server"

- Ensure PostgreSQL service is running
- On Windows: Check Services (postgresql-x64-XX should be running)
- Try: `pg_isready -h localhost`

### Error: "password authentication failed"

- Verify password is correct: `Dinesh@099`
- Check `.env` file has correct credentials
- Try connecting manually: `psql -U postgres -h localhost`

### Error: "database does not exist"

- Run `python setup_db.py` to create it
- Verify in psql: `\l` (should list databases)

### Error: "FATAL: remaining connection slots are reserved"

- Too many connections to the database
- Restart PostgreSQL service

### Manually Create Database (if setup_db.py fails)

```bash
# Connect to postgres
psql -U postgres -h localhost

# In psql prompt, run:
CREATE DATABASE project_infosys;
\q
```

## Verify Everything Works

1. Registration test:

   - Go to http://localhost:3000
   - Click "Register here"
   - Enter name, email, and password
   - Click "Create Account"

2. Login test:
   - Click "Login here"
   - Enter your email and password
   - Should see: "Hi! [Your Name]"

If you see success messages, everything is working correctly!

## Database Structure

The database automatically creates the following table:

```
users:
- id (Primary Key)
- name (String)
- email (String, Unique)
- password (String - hashed)
- dob (Date, optional)
- created_at (DateTime)
```

All new user registrations are stored here.
