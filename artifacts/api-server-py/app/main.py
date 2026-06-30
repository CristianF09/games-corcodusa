"""FastAPI app entrypoint — port of app.ts + index.ts.

Run locally:    uvicorn app.main:app --reload --port 8080
Render start:    uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CLERK_SECRET_KEY, STRIPE_SECRET_KEY
from app.db import close_db, connect_db
from app.logger import log_info
from app.routers import contact, games, health, payments, users


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_db()
    log_info("Connected to MongoDB")
    if STRIPE_SECRET_KEY:
        log_info("Stripe configured (STRIPE_SECRET_KEY present)")
    else:
        log_info("Stripe init skipped (STRIPE_SECRET_KEY not set)")
    if not CLERK_SECRET_KEY:
        log_info("Clerk init skipped (CLERK_SECRET_KEY not set) — auth routes will 500")
    yield
    await close_db()


app = FastAPI(title="Corcodusa API", lifespan=lifespan)

# Mirrors cors({ credentials: true, origin: true }) on the Node side: reflect
# whatever Origin the browser sent (required when allow_credentials=True —
# CORS forbids combining a literal "*" origin with credentials).
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(games.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(contact.router, prefix="/api")


@app.get("/")
async def root():
    """Friendly response on the bare domain instead of a 404 — covers
    Render's own health-check pings (HEAD /) and anyone opening the API
    domain directly in a browser. Real endpoints live under /api/*."""
    return {"service": "Corcodusa API", "status": "ok", "docs": "/docs"}

# Mirrors `app.use("/api/assets", express.static(...))` — serves
# attached_assets/ (repo root) at /api/assets/*, same as the Node backend.
_workspace_root = Path(__file__).resolve().parents[2]
_assets_dir = _workspace_root / "attached_assets"
if _assets_dir.is_dir():
    app.mount("/api/assets", StaticFiles(directory=str(_assets_dir)), name="assets")
