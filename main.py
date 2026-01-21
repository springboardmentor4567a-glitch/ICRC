from fastapi import FastAPI
from dotenv import load_dotenv
from backend.claims_api import router as claims_router

load_dotenv()

app = FastAPI()

app.include_router(claims_router)

@app.get("/")
def read_root():
    return {"message": "Insurance API"}
