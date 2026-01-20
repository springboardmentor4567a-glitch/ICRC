from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, policy, claim, recommendation
from app.routes import auth, users, policies, claims
from app.routes import debug_claims

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://172.16.0.2:3002",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(policies.router)
app.include_router(claims.router, prefix="/claims", tags=["claims"])
app.include_router(debug_claims.router, prefix="/debug-claims", tags=["debug"])

@app.get("/")
def root():
    return {"message": "Insurance Comparison API is running!"}