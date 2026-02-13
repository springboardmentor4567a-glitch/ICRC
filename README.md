# Insurance Comparison & Policy Recommendation Assistant

A full-stack web application that helps users compare insurance policies, calculate premiums, file claims, track claim status, and receive personalized policy recommendations using AI-powered chatbot assistance.

## Features

- **Policy Comparison**: Compare different insurance policies side-by-side
- **Premium Calculator**: Calculate insurance premiums based on user inputs
- **Claim Filing**: Submit and manage insurance claims
- **Claim Tracking**: Monitor the status of filed claims in real-time
- **AI Chatbot**: Get personalized recommendations and support through an intelligent chatbot
- **Admin Dashboard**: Administrative panel for managing claims and users
- **Notification Preferences**: Customize how you receive claim status updates
- **Multi-factor Authentication**: Secure authentication for user accounts
- **S3 Integration**: Secure file upload and storage for claims documentation

## Project Structure

```
├── backend/                    # FastAPI backend server
│   ├── app/
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── auth.py            # Authentication utilities
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # Database operations
│   │   ├── database.py        # Database configuration
│   │   ├── s3_service.py      # AWS S3 integration
│   │   ├── celery_app.py      # Async task queue
│   │   ├── tasks.py           # Background tasks
│   │   └── uploads/           # Uploaded claim documents
│   ├── requirements.txt        # Python dependencies
│   └── test_*.py             # Test files
│
└── frontend/                  # React + Vite frontend
    ├── src/
    │   ├── pages/             # React page components
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── FileClaim.jsx
    │   │   ├── TrackClaims.jsx
    │   │   ├── PolicyComparison.jsx
    │   │   ├── PremiumCalculator.jsx
    │   │   ├── Recommendations.jsx
    │   │   ├── Chatbot.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── components/        # Reusable components
    │   ├── utils/
    │   │   └── api.js         # API client
    │   └── main.jsx           # React entry point
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (with SQLAlchemy ORM)
- **Authentication**: JWT tokens
- **File Storage**: AWS S3
- **Task Queue**: Celery
- **Email**: SMTP notifications

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- AWS S3 credentials (for file uploads)
- SMTP credentials (for email notifications)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Training/Training/backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in a `.env` file:
```
DATABASE_URL=sqlite:///./users.db
SECRET_KEY=your_secret_key_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

4. Start the backend server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Training/Training/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with API endpoint:
```
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Policies
- `GET /api/policies` - Get all policies
- `POST /api/policies/compare` - Compare multiple policies
- `GET /api/policies/{id}` - Get policy details

### Claims
- `POST /api/claims` - File a new claim
- `GET /api/claims` - Get user's claims
- `GET /api/claims/{id}` - Get claim details
- `PATCH /api/claims/{id}` - Update claim status (admin)

### Chatbot
- `POST /api/chat` - Send message to chatbot
- `GET /api/chat/history` - Get chat history

## Testing

Run backend tests:
```bash
python test_server.py
python test_db.py
python test_email_notifications.py
python test_s3_upload.py
```

## Development

### Code Style
- Python: Follow PEP 8 guidelines
- JavaScript: Use ESLint configuration provided

### Linting
- Backend: `flake8` or `pylint`
- Frontend: `npm run lint`

## Deployment

### Backend
```bash
# Using Uvicorn with Gunicorn in production
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push to your branch
6. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please create an issue in the repository or contact the development team.

## Authors

- Omendra Pratap Singh

## Acknowledgments

- FastAPI documentation and community
- React and Vite communities
- Tailwind CSS framework
