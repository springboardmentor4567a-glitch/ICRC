from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app import models
from app.routers import users, policies, claims, admin, login

app = FastAPI(title="ICRCA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(login.router)
app.include_router(users.router)
app.include_router(policies.router)
app.include_router(claims.router)
app.include_router(admin.router)


@app.get("/")
def home():
    return {"message": "Backend running successfully 🚀"}

