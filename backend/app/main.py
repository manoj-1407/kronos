from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .database import create_db_and_tables
from .routers import simulate, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Kronos — OS Internals Visualizer API",
    description="Simulation and analytics API for CPU scheduling, memory, disk, and deadlock analysis.",
    version="1.1.0",
    lifespan=lifespan,
)

allowed_origins = [origin.strip() for origin in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router)
app.include_router(history.router)


@app.get("/")
def root():
    return {"name": "Kronos API", "version": "1.1.0",
            "docs": "/docs", "status": "online"}


@app.get("/health")
def health():
    return {"status": "ok"}
