# Architecture

## One-line summary

React SPA → Supabase (auth + Postgres + RLS). Express sits idle for
now; it exists to host future webhook + PDF work that legitimately
needs the service-role key.

## Auth flow

1. `artifacts/meta-report/src/lib/supabase.ts` creates a singleton
   `createClient<Database>(url, anonKey, { auth: {...} })`. Session
   + refresh tokens live in `localStorage`; `detectSessionInUrl`
   handles OAuth and magic-link callbacks.
2. `src/context/AuthContext.tsx` is the one React-side source of
   truth. It subscribes to `onAuthStateChange`, loads the matching
   `profiles` row, and checks the `admins` table. `isLoaded` flips
   true as soon as the session check returns — profile + admin fetch
   happen in the background so a stalled query never wedges the UI.
3. `/auth/callback` route → `supabase.auth.getSession()` (the SDK
   already called `exchangeCodeForSession` under the hood) → redirect
   home.
4. `/auth/reset-password` route → `supabase.auth.updateUser({ password })`.

Admin status comes from the presence of a row in `public.admins`. No
JWT claim trickery, no separate admin login flow. Grant admin by
inserting the profile uuid via SQL.

## RLS model

Every table is RLS-enabled **and** `FORCE`d (so even the table owner
obeys policies). Policies are always scoped to the `authenticated`
role. Writes that need to bypass RLS (trigger-driven usage bumps,
Stripe webhook updates) happen inside `SECURITY DEFINER` functions or
via the service-role key.

### `profiles`
- SELECT: own row, or admin.
- UPDATE: own row.
- No INSERT policy. Rows are created by `handle_new_user()` triggered
  on `auth.users` insert (SECURITY DEFINER bypasses RLS). The trigger
  swallows exceptions so a profile-creation failure never blocks
  signup; a nightly audit can reconcile orphan `auth.users` rows if
  that ever happens.

### `admins`
- SELECT: admins only.
- All writes: service_role only.

### `reports`
- SELECT: own, or admin.
- INSERT: `user_id = auth.uid() AND can_create_report(auth.uid())`.
  The `can_create_report` helper checks the plan and the current-
  month usage count. Free = 3/month; basic + pro = unlimited.
- DELETE: own, or admin.
- No UPDATE.

### `usage`
- SELECT: own, or admin.
- INSERT / UPDATE / DELETE revoked from anon + authenticated.
  Only mutator: the `bump_usage_on_report` trigger on `reports`
  INSERT, which `SECURITY DEFINER` UPSERTs the monthly count
  atomically with the insert.

### `subscriptions`
- SELECT: own, or admin.
- All writes: service_role only (Stripe webhook territory).

## Migrations

Drizzle manages columns + types; raw SQL files in `lib/db/sql/` own
everything Drizzle can't model — enums with cross-schema FKs,
triggers, functions, and RLS policies. Numbered for execution order:

```
001_enums_and_schema.sql
002_helpers.sql           is_admin, current_user_plan
003_profile_trigger.sql   handle_new_user on auth.users
004_usage_increment.sql   bump_usage_on_report on public.reports
005_can_create_report.sql freemium gate
010_rls_profiles.sql
011_rls_admins.sql
012_rls_reports.sql
013_rls_usage.sql
014_rls_subscriptions.sql
```

We applied these via the Supabase MCP during migration; for
redeploys, open the Supabase SQL editor and run each file in order.

## Express today

`artifacts/api-server` holds exactly one live route,
`GET /api/healthz`, plus `src/middleware/supabase-auth.ts` — a
scaffold that verifies `Authorization: Bearer <supabase-jwt>` using
`jose` + `SUPABASE_JWT_SECRET`. Nothing imports it yet. It exists so
future Stripe webhook + PDF endpoints have an auth check ready.

When those land, the workspace either stays (Node serverless on
Vercel) or gets folded into Vercel API routes at repo root. Decision
deferred to deploy time.

## Freemium UX

- Guests are allowed exactly 1 report, tracked in `localStorage` so
  they can "try before sign up". After that the sign-up modal opens.
- Logged-in users hit Supabase. The UI reads `usage.report_count`
  for the current month to render the "N free reports left" pill.
  After each successful insert we refetch; the trigger keeps the
  count correct.
- RLS 42501 errors on `reports` INSERT are the server-side limit
  block. The UI maps them to the existing `UpgradeModal`.

## Testing for security regressions

After any change to SQL in `lib/db/sql/`, run the two-user test:

```sql
-- service-role session
insert into auth.users (...) values (user_a), (user_b);

-- switch to user A
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"<user-a-uuid>","role":"authenticated"}';

-- these should all follow the documented rules:
-- SELECT from profiles returns only A
-- INSERT into reports (user_id = B) → 42501
-- INSERT into reports (user_id = A) 3 times → OK; 4th → 42501
-- after INSERT INTO public.admins of user A, SELECT from profiles returns both
```

## Known deferrals

- **Stripe.** `subscriptions` table is ready; no webhook handler
  yet. Will land in `api-server` with the scaffolded JWT middleware.
- **Report history page.** The `reports` table persists all rows —
  just nothing renders them in the UI today.
- **Basic-tier 30-day retention.** Planned as a `pg_cron` nightly
  delete, deferred until a Basic plan actually exists.
- **Test suite.** No Vitest setup. Excel parser + analysis generator
  are the highest-value units to cover when we add one.
