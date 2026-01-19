# Insurez - Insurance Management System

This project is a full-stack web application with a React frontend and a Python/Flask backend.

## Tech Stack

- **Frontend:** React
- **Backend:** Python, Flask, SQLAlchemy
- **Database:** PostgreSQL

## Prerequisites

- Node.js and npm
- Python and pip
- A running PostgreSQL server

## Setup Instructions

### 1. Backend Setup

First, navigate into the backend directory.

```bash
cd backend
```

Create and activate a Python virtual environment (optional but highly recommended).

```bash
# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
venv\\Scripts\\activate
```

Install the required Python packages.

```bash
pip install -r requirements.txt
```

Configure your environment variables. Create a `.env` file in the `backend` directory. You can copy the example file to get started.

```bash
cp .env.example .env
```

Now, edit the `.env` file with your PostgreSQL credentials. It should look like this:

```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/insurez_db
JWT_SECRET_KEY=your-super-secret-key-change-this
FLASK_ENV=development
```

> **Important:** Make sure you have already created a database named `insurez_db` in PostgreSQL.

Run the script to create the database tables.

```bash
python setup_db.py
```

Finally, start the backend server.

```bash
python run.py
```

The server will start on `http://127.0.0.1:5000`.

### 2. Frontend Setup

Open a **new terminal** and navigate to the project's root directory.

Install the Node.js dependencies.

```bash
npm install
```

Start the frontend development server.

```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`.
