import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(
    title="Predictive Portfolio Analytics API",
    description="REST API for quant metrics and Monte Carlo simulations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "quant-engine"}
