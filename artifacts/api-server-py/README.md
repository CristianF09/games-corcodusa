# api-server-py

Backend Python (FastAPI) pentru Corcodusa Games.

## Stack

- FastAPI 0.138 + Uvicorn
- MongoDB prin Motor (driver async) + Beanie (ODM async peste Pydantic)
- Clerk: `clerk-backend-api` (SDK oficial) — verificare JWT locală, fără
  round-trip de rețea per request
- Stripe: `stripe` SDK oficial, `StripeClient` cu metode async (`*_async`)

## Structură

```
app/
  main.py        — app FastAPI, CORS, pornire/închidere conexiune Mongo
  config.py      — citire variabile de mediu
  db.py          — conexiune Motor + init Beanie
  auth.py        — dependency FastAPI pentru rute protejate (Clerk)
  stripe_client.py
  webhooks.py    — verificare semnătură webhook Stripe (TODO: vezi mai jos)
  models/        — Game, User (Beanie), counter.py (id numeric secvențial)
  routers/       — health, games, users, payments
scripts/
  seed_games.py  — portare 1:1 a scripts/src/seed-games.ts
```

## Rulare locală

```bash
cd artifacts/api-server-py
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completează MONGODB_URI, CLERK_SECRET_KEY, STRIPE_*
uvicorn app.main:app --reload --port 8080
```

Seed date de test: `python -m scripts.seed_games` (cu `MONGODB_URI` setat).

## Deploy pe Render

1. **New + → Web Service**, conectează același repo Git.
2. **Root Directory**: `artifacts/api-server-py`
3. **Runtime**: Python 3
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Environment** → adaugă: `MONGODB_URI`, `CLERK_SECRET_KEY`,
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_BASE_URL` (URL-ul
   **frontend-ului**, `https://games.corcodusa.ro` — Stripe redirectează
   userul acolo după plată, nu către acest API).
7. Subdomeniu pentru acest API: `games-api.corcodusa.ro` (CNAME în
   Cloudflare către `<serviciu>.onrender.com`) — **nu** `api.corcodusa.ro`,
   care e backend-ul separat al site-ului corcodusa.ro (livrare PDF-uri,
   alt repo). MongoDB Atlas `0.0.0.0/0` în Network Access — la fel ca la
   varianta Node.

## Verificat în această sesiune

Am instalat toate pachetele și rulat aplicația FastAPI completă (cu o bază
Mongo simulată în memorie — `mongomock_motor`, doar pentru test, nu face
parte din aplicație) prin `TestClient`, apelând fiecare rută:
`/api/healthz`, `/api/games` (+ filtre), `/api/games/featured`,
`/api/games/{id}` (găsit + 404), `/api/games/categories`,
`/api/stats/overview`, `/api/users/me` (401/500 fără Clerk configurat, ca
și în Node), `/api/stripe/webhook` (400 fără semnătură),
`/api/payments/products` (fallback fără Stripe configurat). Toate au
răspuns corect, cu exact aceleași nume de câmpuri JSON ca backend-ul Node.

Nu am putut testa cu Clerk/Stripe/MongoDB *reale* din acest sandbox (fără
credențiale, fără rețea către Atlas) — testează din nou cu cheile reale
înainte de a trece definitiv pe acest backend.

## TODO

- **Stripe webhook**: verificarea semnăturii funcționează, dar nu se
  procesează niciun eveniment (`checkout.session.completed`,
  `customer.subscription.updated/deleted`).
- **Clerk proxy pentru domeniu custom** — folosit doar dacă NU configurezi
  un CNAME `clerk.*`; caz de margine, nu blocant.
