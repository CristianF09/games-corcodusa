# Corcodusa — Jocuri Educaționale

Platformă de jocuri educaționale pentru copii români cu vârste între 3 și 8 ani, cu autentificare email + parolă, abonamente Stripe și o bibliotecă de jocuri protejate.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm --filter @workspace/corcodusa run dev` — run the frontend (Vite, port 5173, accessible at `/`)
- API server (FastAPI, Python — the active backend, targeted for the Render deploy): see `artifacts/api-server-py/README.md`.
- `pnpm run typecheck` — full typecheck across all (remaining JS/TS) packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

### Required environment variables

- `MONGODB_URI` — MongoDB connection string
- `STRIPE_SECRET_KEY` — enables payments (optional; API falls back to mock product data when unset)
- `STRIPE_WEBHOOK_SECRET` — enables Stripe webhook signature verification (optional)
- `APP_BASE_URL` — base URL of the **frontend** (not the API), used to build Stripe checkout/portal redirect URLs (defaults to `http://localhost:5173`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, wouter (routing) — deployed to Firebase Hosting (`games.corcodusa.ro`)
- **Domains**: `games.corcodusa.ro` (this frontend) and `games-api.corcodusa.ro` (this backend, once deployed) are distinct from `corcodusa.ro` / `www.corcodusa.ro` and `api.corcodusa.ro`, which belong to a separate, unrelated business (PDF-delivery site, repo `CristianF09/forkids`) — same Stripe account, different everything else.
- API: `artifacts/api-server-py` — FastAPI + Beanie/Motor, deployed to Render
- DB: MongoDB + Beanie/Motor (Mongoose for `lib/db` seed scripts)
- Validation: Zod (`zod/v4`)
- Auth: email + parolă, sesiune în cookie httpOnly (`/api/auth/*`) — `ProtectedRoute` cere login pentru jocuri și cont
- Payments: Stripe (graceful fallback when not configured; webhook signature verification works, but event handling — e.g. `checkout.session.completed` — is still a TODO)
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: Vite (frontend); see `artifacts/api-server-py/README.md` for the Python API

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/` — generated React Query hooks (do not edit)
- `lib/db/src/schema/` — Mongoose schema (users.ts, games.ts); still used by `scripts/src/seed-games.ts`, the Node seed script
- `artifacts/api-server-py/app/routers/` — FastAPI route handlers (the active API)
- `artifacts/corcodusa/src/pages/` — frontend pages (home, games, dashboard, pricing)
- `artifacts/corcodusa/src/components/` — shared UI components
- `artifacts/corcodusa/src/games/` — the actual playable game components, mapped by numeric id in `GAME_COMPONENTS`
- `attached_assets/` — game cover images (served at `/api/assets/*`)

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → type-safe hooks. Always edit the spec first, then run codegen.
- **Stripe graceful fallback**: Stripe integration is optional; API returns mock product data when not connected.
- **Static game assets**: Game cover images live in `attached_assets/` and are served by the API at `/api/assets/` (FastAPI `StaticFiles` mount).
- **Protected routes**: frontend guard (`ProtectedRoute`) + API dependency `require_user` (`app/auth.py`).

## Product

- Landing page with hero, live statistics, game categories, featured games, features overview, and FAQ
- 7-day free trial + paid subscription (Full Access) via Stripe
- Browsable game library with category filtering and search
- User dashboard showing subscription status and account management

## Gotchas

- **Stripe not configured**: set `STRIPE_SECRET_KEY` (and optionally `STRIPE_WEBHOOK_SECRET`) before checkout works in production.
- **Game images**: stored in `attached_assets/*.png`, served via `/api/assets/`. Add new images there and seed the DB with `/api/assets/<filename>` URLs.
- **GAME_COMPONENTS vs seed data**: `artifacts/corcodusa/src/games/index.ts` maps numeric game ids to playable components; ids 4–11 from the seed data don't all line up thematically with their component, and id 11 has no component at all (falls back to a "in development" placeholder). Check this mapping before adding/reordering seed games.
