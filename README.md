# AdClarity

React + Supabase app that turns a Meta Ads XLSX export into a
nine-section performance analysis, with a freemium tier gated on the
server via Postgres RLS.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 7 + Wouter + Tailwind + Radix UI |
| Auth + DB + Storage | Supabase (Postgres + Auth + RLS) |
| ORM / migrations | Drizzle schema + raw SQL migrations in `lib/db/sql/` |
| Backend | Express 5 — slim: `/healthz` + scaffolded JWT middleware for future server-only work |
| Monorepo | pnpm workspaces |

Frontend talks to Supabase directly via `@supabase/supabase-js`. RLS is
the enforcement layer — see `docs/architecture.md`.

## Layout

```
artifacts/
  meta-report/      React SPA (the actual AdClarity app)
  api-server/       Express — /healthz only today; reserved for Stripe webhooks + PDF gen
lib/
  db/
    src/schema/     Drizzle table definitions (types only)
    sql/            Raw SQL migrations (enums, triggers, RLS policies)
scripts/            One-off dev scripts
docs/
  architecture.md   RLS model + auth flow
  supabase-migration.md  Plan that produced this repo (historical)
```

## Running locally

```bash
pnpm install
cp .env.example artifacts/meta-report/.env.local  # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
PORT=5180 BASE_PATH=/ pnpm --filter @workspace/meta-report dev
```

Visit http://localhost:5180.

Optional backend (only needed when you wire up a server-side route):

```bash
PORT=8080 pnpm --filter @workspace/api-server dev
```

## Environment

All values come from Supabase **Project Settings → API / Database**.

| Var | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend `.env.local` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend `.env.local` | Publishable key (safe in the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Never expose — webhooks / admin tasks |
| `SUPABASE_JWT_SECRET` | server only | Used by `src/middleware/supabase-auth.ts` |
| `DATABASE_URL` | Drizzle push / scripts | Session-mode pooler (port 5432) |
| `DATABASE_POOL_URL` | Runtime | Transaction-mode pooler (port 6543) |

## Schema + migrations

Drizzle owns the TypeScript schema in `lib/db/src/schema/`. All DDL,
triggers, functions, and RLS policies live as numbered SQL files in
`lib/db/sql/`. They were applied via the Supabase MCP server during
the migration; to re-apply by hand, open the Supabase SQL editor and
run each file in numeric order.

Key tables: `profiles` (1:1 to `auth.users`), `admins`, `reports`,
`usage`, `subscriptions`.

Regenerate frontend types after a schema change:

```bash
pnpm --filter @workspace/meta-report run gen:db-types
```

## Freemium enforcement

- Guests: 1 free report tracked in localStorage, then nudge to sign up.
- Free signed-in: 3 reports/month. Enforced by
  `public.can_create_report(uid)` in the `reports` INSERT RLS policy.
  The 4th insert comes back as Postgres 42501, which the UI catches
  and turns into the upgrade modal.
- `basic` + `pro`: unlimited. Plan lives on `profiles.plan` (enum).

## Typecheck / build

```bash
pnpm run typecheck    # all workspaces, via project references
pnpm run build        # typecheck + each workspace's own build
```

## Branch + remote

Working branch: `jordon-ai-dev` on `github.com/connorwhiting10/AdClarity`.

## Auth providers

Email + password, magic links, and Google OAuth are live. Facebook
was evaluated and dropped — re-enable by restoring the button in
`src/components/auth/OAuthButtons.tsx` once Meta app review is done.
