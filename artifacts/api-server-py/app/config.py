"""Environment configuration, loaded once at import time.

Mirrors the Node backend's approach (read directly from `process.env`, fail
loudly at startup if something required is missing) rather than introducing
a settings framework — this app is small enough that explicit beats clever.
"""

import os

from dotenv import load_dotenv

load_dotenv()  # no-op in production (Render injects env vars directly)


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} environment variable is required but was not provided.")
    return value


MONGODB_URI = _require("MONGODB_URI")

# Optional at import time — routes that need these fail with a clear 5xx
# instead of crashing the whole server, matching the Node backend's
# "Stripe init skipped" / "Clerk not configured" soft-degradation behavior.
CLERK_SECRET_KEY = os.environ.get("CLERK_SECRET_KEY")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")
APP_BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:8080")


def require_port() -> int:
    raw = os.environ.get("PORT")
    if not raw:
        raise RuntimeError("PORT environment variable is required but was not provided.")
    port = int(raw)
    if port <= 0:
        raise RuntimeError(f"Invalid PORT value: {raw!r}")
    return port
