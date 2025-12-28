# Project Infosys - Setup Guide

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=sqlite:///project.db
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
FLASK_ENV=development
```

### 3. Run the Backend Server

```bash
python run.py
```

The server will start on `http://127.0.0.1:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will open on `http://localhost:3000`

## Features Implemented

✅ User Registration with password hashing
✅ User Login with JWT authentication
✅ Protected routes (profile endpoint)
✅ CORS enabled for frontend-backend communication
✅ Comprehensive error handling
✅ Database persistence with SQLAlchemy

## Troubleshooting

### Registration shows "Server error"

1. Check browser console (F12) for detailed error messages
2. Ensure backend is running on port 5000
3. Check `.env` file has correct `DATABASE_URL`
4. Verify all dependencies are installed: `pip install -r requirements.txt`

### CORS Issues

The backend is configured to accept requests from all origins. If issues persist:

- Clear browser cache (Ctrl+Shift+Delete)
- Restart both backend and frontend servers

### Database Issues

To reset the database:

1. Delete `project.db` file in the backend folder
2. Restart the backend server (it will recreate the database automatically)

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (requires JWT token)
