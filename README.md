# Corcodusa — Jocuri Educaționale

Platformă de jocuri educaționale pentru copii români cu vârste între 3 și 8 ani, cu autentificare Clerk, abonamente Stripe și o bibliotecă de jocuri protejate.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm --filter @workspace/corcodusa run dev` — run the frontend (Vite, port 5173, accessible at `/`)
- API server (FastAPI, Python — the active backend, targeted for the Render deploy): see `artifacts/api-server-py/README.md`.
- `pnpm run typecheck` — full typecheck across all (remaining JS/TS) packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- The original Node/Express API server and the `mockup-sandbox` UI-preview app have been moved to `_deprecated/` (kept for reference, not part of the active build). Run `pnpm install` again after pulling this change — pnpm will drop their stale workspace links.

### Required environment variables

- `MONGODB_URI` — MongoDB connection string (same database for both the Node and the Python API server)
- `CLERK_SECRET_KEY` / Clerk publishable key — authentication (see [Clerk Dashboard](https://dashboard.clerk.com))
- `STRIPE_SECRET_KEY` — enables payments (optional; API falls back to mock product data when unset)
- `STRIPE_WEBHOOK_SECRET` — enables Stripe webhook signature verification (optional)
- `APP_BASE_URL` — base URL of the **frontend** (not the API), used to build Stripe checkout/portal redirect URLs (defaults to `http://localhost:5173`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, wouter (routing), Clerk React — deployed to Firebase Hosting (`games.corcodusa.ro`)
- **Domains**: `games.corcodusa.ro` (this frontend) and `games-api.corcodusa.ro` (this backend, once deployed) are distinct from `corcodusa.ro` / `www.corcodusa.ro` and `api.corcodusa.ro`, which belong to a separate, unrelated business (PDF-delivery site, repo `CristianF09/forkids`) — same Stripe account, different everything else.
- API: `artifacts/api-server-py` — FastAPI + Beanie/Motor, the active backend, targeted for the Render deploy. (The original Express + Mongoose implementation is archived at `_deprecated/api-server/`, a 1:1 functional reference if ever needed.)
- DB: MongoDB (no more Postgres/Drizzle — fully migrated; legacy SQL files moved to `_deprecated/postgres-legacy/`)
- Validation: Zod (`zod/v4`)
- Auth: Clerk (whitelabel proxy at `/clerk`) — currently **disabled** in the frontend's `ProtectedRoute` for testing; all routes are open
- Payments: Stripe (graceful fallback when not configured; webhook signature verification works, but event handling — e.g. `checkout.session.completed` — is still a TODO)
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`) — still valid as the API contract, even though the Node API that originally implemented it is archived
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
- `_deprecated/` — archived, not part of the active build: `api-server/` (original Node/Express API), `mockup-sandbox/` (standalone UI-preview app), `postgres-legacy/` (old Postgres schema/seed/docker-compose files). Safe to delete fully once you're confident you won't need them as reference.

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → type-safe hooks. Always edit the spec first, then run codegen.
- **Clerk whitelabel proxy**: All Clerk requests go through `/clerk` on the same domain to avoid third-party cookie issues.
- **Stripe graceful fallback**: Stripe integration is optional; API returns mock product data when not connected.
- **Static game assets**: Game cover images live in `attached_assets/` and are served by the API at `/api/assets/` (FastAPI `StaticFiles` mount).
- **Protected routes**: Designed for Clerk authentication to gate the game library and dashboard (frontend guards + API dependency) — currently disabled for testing, see Gotchas.

## Product

- Landing page with hero, live statistics, game categories, featured games, features overview, and FAQ
- Google (and other) login via Clerk
- 7-day free trial + paid subscription (Full Access) via Stripe
- Browsable game library with category filtering and search
- User dashboard showing subscription status and account management

## Gotchas

- **Stripe not configured**: set `STRIPE_SECRET_KEY` (and optionally `STRIPE_WEBHOOK_SECRET`) before checkout works in production.
- **Game images**: stored in `attached_assets/*.png`, served via `/api/assets/`. Add new images there and seed the DB with `/api/assets/<filename>` URLs.
- **Clerk dev keys warning**: expected in development — not an error.
- **GAME_COMPONENTS vs seed data**: `artifacts/corcodusa/src/games/index.ts` maps numeric game ids to playable components; ids 4–11 from the seed data don't all line up thematically with their component, and id 11 has no component at all (falls back to a "in development" placeholder). Check this mapping before adding/reordering seed games.
- **Auth is currently disabled for testing**: `ProtectedRoute` in the frontend doesn't enforce Clerk login — re-enable before shipping if subscription gating matters.
