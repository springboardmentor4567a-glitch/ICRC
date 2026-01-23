from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .claims_api import router as claims_router
from .routers.auth import router as auth_router
from .routers.admin_claims import router as admin_claims_router
from .routers.analytics import router as analytics_router
from .routers.policies import router as policies_router
from .models import engine, Base

load_dotenv()

app = FastAPI()

# Create all tables
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Error creating database tables: {e}")
    # If tables already exist, just continue
    pass

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claims_router)
app.include_router(auth_router)
app.include_router(admin_claims_router)
app.include_router(analytics_router)
app.include_router(policies_router)

@app.get("/")
def read_root():
    return {"message": "Insurance API"}
