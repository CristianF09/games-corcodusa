# Corcodusa — Jocuri Educaționale

Platformă de jocuri educaționale pentru copii români cu vârste între 3 și 8 ani, cu autentificare Clerk, abonamente Stripe și o bibliotecă de jocuri protejate.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, accessible at `/api`)
- `pnpm --filter @workspace/corcodusa run dev` — run the frontend (Vite, accessible at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, wouter (routing), Clerk React
- API: Express 5, Clerk Express middleware
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: Clerk (whitelabel proxy at `/clerk`)
- Payments: Stripe (not yet connected — graceful fallback in place)
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle for API)

## Where things live

- `lib/db/src/schema/` — DB schema (users.ts, games.ts)
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/` — generated React Query hooks (do not edit)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/corcodusa/src/pages/` — frontend pages (home, games, dashboard, pricing)
- `artifacts/corcodusa/src/components/` — shared UI components
- `attached_assets/` — game cover images (served at `/api/assets/*`)

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → type-safe hooks. Always edit the spec first, then run codegen.
- **Clerk whitelabel proxy**: All Clerk requests go through `/clerk` on the same domain to avoid third-party cookie issues.
- **Stripe graceful fallback**: Stripe integration is optional; API returns mock product data when not connected.
- **Static game assets**: Game cover images live in `attached_assets/` and are served by the Express API at `/api/assets/`.
- **Protected routes**: Game library and dashboard require Clerk authentication (frontend guards + API middleware).

## Product

- Landing page with hero, live statistics, game categories, featured games, features overview, and FAQ
- Google (and other) login via Clerk
- 7-day free trial + paid subscription (Full Access) via Stripe
- Browsable game library with category filtering and search
- User dashboard showing subscription status and account management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Stats endpoint**: uses `db.execute(sql`...`).rows[0]` — Drizzle returns `{ rows: [...] }`, not a plain array.
- **Stripe not connected**: must be linked via the Integrations tab before checkout works in production.
- **Game images**: stored in `attached_assets/*.png`, served via `/api/assets/`. Add new images there and seed the DB with `/api/assets/<filename>` URLs.
- **Clerk dev keys warning**: expected in development — not an error.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk customization (branding, providers, localization)
- See the `stripe` skill for connecting Stripe payments
