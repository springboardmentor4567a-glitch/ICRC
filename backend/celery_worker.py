from celery import Celery

celery = Celery(
    "claims",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)
