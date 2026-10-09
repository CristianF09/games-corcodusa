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
# Fallback database name when the URI has no /dbname segment (e.g. a bare
# Atlas connection string without the database path).  Render env vars often
# omit it, so we default to "corcodusa" to match the Atlas cluster setup.
DB_NAME = os.environ.get("DB_NAME", "corcodusa")

# Optional at import time — routes that need these fail with a clear 5xx
# instead of crashing the whole server, matching the Node backend's
# "Stripe init skipped" soft-degradation behavior.
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")
APP_BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:5173")

# The two plans sold on /pricing. Defaults are the live-mode Stripe IDs
# (Abonament Lunar: prod_UoSALnnNfV0wRO, Abonament Anual: prod_UoUatUiQNrN8qM);
# override via env when testing against a different Stripe account.
STRIPE_PRICE_ID_MONTHLY = os.environ.get("STRIPE_PRICE_ID_MONTHLY", "price_1TopGIK6Qc2WK3kdDj0jfMlI")
STRIPE_PRICE_ID_ANNUAL = os.environ.get("STRIPE_PRICE_ID_ANNUAL", "price_1TorbBK6Qc2WK3kdMIBQmGQ8")

# Contact form (POST /api/contact) — sent via Resend's HTTP API. Soft-degrades
# like Stripe/Resend above: missing key means the route 500s with a clear
# message instead of crashing the whole server at import time.
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
# Must be a verified sender on the Resend account/domain. corcodusa.ro is
# verified in Resend, so the default sends from there; Resend's shared test
# sender (onboarding@resend.dev) only delivers to the account owner's own
# email, which made the contact form 502 for every visitor.
CONTACT_EMAIL_FROM = os.environ.get("CONTACT_EMAIL_FROM", "Corcodusa <no-reply@corcodusa.ro>")
CONTACT_EMAIL_TO = os.environ.get("CONTACT_EMAIL_TO", "contact@corcodusa.ro")

# Datele vânzătorului — aceleași ca în artifacts/corcodusa/src/lib/company-info.ts
# (sursa: corcodusa.ro, verificat 2026-10-09). Apar pe factura PDF (app/invoice.py).
# Sunt constante în cod, nu variabile de mediu: modifici aici și în company-info.ts.
INVOICE_SERIES = os.environ.get("INVOICE_SERIES", "CG")
COMPANY_LEGAL_NAME = "Corcodusa"
COMPANY_CUI = "55147026"
COMPANY_REG_COM = "F2026034422005"
COMPANY_ADDRESS = "Bulevardul Bucureștii Noi, Nr. 136, Et. P, Ap. 5, Sectorul 1, București"
COMPANY_EMAIL = "contact@corcodusa.ro"

# Autentificare proprie (email + parolă), vezi app/auth.py.
SESSION_DAYS = 30
RESET_TOKEN_MINUTES = 60


def require_port() -> int:
    raw = os.environ.get("PORT")
    if not raw:
        raise RuntimeError("PORT environment variable is required but was not provided.")
    port = int(raw)
    if port <= 0:
        raise RuntimeError(f"Invalid PORT value: {raw!r}")
    return port
