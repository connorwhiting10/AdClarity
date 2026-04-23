# AdClarity: Clerk/Replit → Supabase/Vercel Migration Plan

## Goal

Move authentication from Clerk to Supabase Auth, move the database from Replit Postgres to Supabase Postgres, have the React app talk directly to Supabase (leveraging RLS for security), slim the Express API server down to a stub for future server-only needs, and deploy on Vercel instead of Replit.

## Architectural decisions (locked in)

1. **Frontend talks directly to Supabase** via `@supabase/supabase-js`. No Express round-trips for reads/writes on user-owned data.
2. **RLS is the enforcement layer** — every table is default-deny, with explicit policies. Freemium limits enforced via Postgres functions, not client-side.
3. **Drizzle stays** for schema management (point `DATABASE_URL` at Supabase). Raw SQL for RLS/triggers/functions lives in `lib/db/sql/` and is applied via Supabase SQL editor or CLI.
4. **Drop the OpenAPI/Orval pipeline** (`lib/api-spec`, `lib/api-zod`, `lib/api-client-react`) — nothing left to generate once React goes direct-to-Supabase.
5. **Keep a minimal Express server** (`/healthz` + scaffold) for future Stripe webhooks and PDF generation — both legitimately need server + service-role key.
6. **Roll own auth UI** on Radix/Tailwind, skip `@supabase/auth-ui-react`.
7. **Deploy on Vercel** — frontend as static build, Express as serverless function, auto-deploy from GitHub.
8. **Admins table** replaces the admin JWT system. `is_admin(uid)` SQL helper for RLS policies.
9. **`profiles` table** keyed to `auth.users(id)` replaces `usersTable`. Auto-created via trigger on signup.

---

## Phase 0 — Prep: Git, secrets, repo

**Goal:** working git repo, connected to GitHub, no secrets in history.

**Steps:**
1. `git init` in project root.
2. Verify `.gitignore` covers: `node_modules/`, `dist/`, `.env*`, `.mcp.json`, `.DS_Store`, any local build artifacts.
3. Audit for committed secrets — grep for `sk_`, `CLERK_SECRET`, `DATABASE_URL=`, JWT-looking strings in any files. Move anything found to env vars.
4. Create `.env.example` at root documenting every env var (blank values).
5. First commit: `git add . && git commit -m "Initial import from Replit"`.
6. Create GitHub repo (private). Decide owner — you or your friend's org.
7. `git remote add origin ...` and push.

**Success:** repo is on GitHub, no secrets in `git log -p`, `.env.example` documents every variable.

---

## Phase 1 — Supabase project configuration

**Goal:** Supabase project ready to receive schema and users.

**Steps (all in Supabase dashboard):**
1. **Authentication → Providers:**
   - Enable Email (password or magic link — recommend both).
   - Enable Google OAuth (Client ID + Secret from Google Cloud Console).
   - Enable Facebook OAuth (Client ID + Secret from Meta for Developers). Natural fit for Meta-ads audience.
2. **Authentication → URL Configuration:**
   - Site URL: `http://localhost:5173` for dev, later production URL.
   - Additional redirect URLs: add prod + any preview domains (Vercel preview URLs when known).
3. **Authentication → Email Templates:** tweak confirmation/reset templates to AdClarity branding (can be deferred).
4. **Authentication → Settings:**
   - Decide: require email confirmation (default, safer) or auto-confirm (lower friction).
5. **Project Settings → API:** copy the anon key + service_role key into env management.

**Env vars to capture:**
- `VITE_SUPABASE_URL` (public)
- `VITE_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to frontend)
- `DATABASE_URL` — session mode pooler (port 5432) for migrations
- `DATABASE_POOL_URL` — transaction mode pooler (port 6543) for runtime

**Success:** MCP server can list the (empty) `public` schema. Auth providers are toggled on.

---

## Phase 2 — Database schema + RLS

**Goal:** production-ready schema with RLS covering every table, seeded with future-needed tables.

**File layout:**
- `lib/db/src/schema/` — Drizzle schema (what Drizzle manages: tables + columns + indexes)
- `lib/db/sql/` (new) — raw SQL for things Drizzle doesn't model well: RLS policies, triggers, functions, enum types. Numbered for ordering: `001_helpers.sql`, `002_profiles_trigger.sql`, etc.
- `lib/db/scripts/apply-sql.ts` (new) — small script to apply all SQL files in order via pg client.

**Drizzle schema changes:**

Delete `lib/db/src/schema/auth.ts` (current `usersTable` tied to Clerk IDs) and replace with:

```ts
// profiles.ts
profilesTable:
  id           uuid PK          — references auth.users(id) on delete cascade
  email        text NOT NULL
  first_name   text
  last_name    text
  avatar_url   text
  plan         plan_enum NOT NULL DEFAULT 'free'  -- 'free' | 'basic' | 'pro'
  created_at   timestamptz NOT NULL DEFAULT now()
  updated_at   timestamptz NOT NULL DEFAULT now()

// admins.ts
adminsTable:
  user_id      uuid PK          — references profiles(id) on delete cascade
  created_at   timestamptz NOT NULL DEFAULT now()

// reports.ts  (future-ready: Basic 30d history, Pro full)
reportsTable:
  id           uuid PK DEFAULT gen_random_uuid()
  user_id      uuid NOT NULL    — references profiles(id) on delete cascade
  filename     text
  uploaded_at  timestamptz NOT NULL DEFAULT now()
  analysis     jsonb            — full ParsedReport.analysis
  summary      jsonb            — ParsedReport.summary
  date_range   text
  (index on user_id, uploaded_at desc)

// usage.ts  (monthly report counts for freemium enforcement)
usageTable:
  user_id      uuid NOT NULL
  month        date NOT NULL    — first day of month
  report_count int NOT NULL DEFAULT 0
  PK (user_id, month)
  references profiles(id) on delete cascade

// subscriptions.ts  (Stripe, future)
subscriptionsTable:
  user_id              uuid PK — references profiles(id)
  stripe_customer_id   text UNIQUE
  stripe_subscription_id text UNIQUE
  plan                 plan_enum
  status               text           -- active, canceled, past_due, etc.
  current_period_end   timestamptz
  updated_at           timestamptz NOT NULL DEFAULT now()
```

**Raw SQL (`lib/db/sql/`):**

- `001_enums.sql` — `CREATE TYPE plan_enum AS ENUM ('free', 'basic', 'pro');` (must exist before Drizzle push creates columns referencing it — apply this BEFORE drizzle push).
- `002_helpers.sql` — `is_admin(uid uuid)` function returning bool via lookup in `admins`. `current_user_plan()` reading from profiles.
- `003_profile_trigger.sql` — `handle_new_user()` function + trigger on `auth.users` insert that inserts a row into `public.profiles` with `new.id`, `new.email`, etc.
- `004_usage_increment.sql` — `increment_usage(uid uuid)` function that upserts a row in `usage` for the current month. Returns the new count.
- `005_can_create_report.sql` — `can_create_report(uid uuid)` function: checks plan, checks usage, returns bool. Used by RLS `WITH CHECK` on `reports` insert.
- `010_rls_profiles.sql` — `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;` + policies: users SELECT/UPDATE own row, admins SELECT all.
- `011_rls_admins.sql` — admins table: only admins can read; service_role bypasses anyway.
- `012_rls_reports.sql` — users SELECT/DELETE own reports; INSERT only if `can_create_report(auth.uid())`; admins SELECT all.
- `013_rls_usage.sql` — users SELECT own; writes only via function (revoke direct insert/update from anon/authenticated).
- `014_rls_subscriptions.sql` — users SELECT own only; no direct writes (service_role only, for webhooks).

**Execution order:**
1. Apply `001_enums.sql` in Supabase SQL editor.
2. `pnpm --filter @workspace/db run push` to let Drizzle create/alter tables.
3. Apply remaining SQL files in numeric order.
4. Verify in Supabase dashboard: every table has RLS enabled, policies list is non-empty.

**Testing checklist:**
- Create two test users via Auth dashboard.
- As user A, confirm you can read only your own profile.
- Attempt to read user B's profile — must fail.
- Attempt to insert a report for user B — must fail.
- Free user: insert 3 reports in a month, fourth must fail.
- Promote user A to admin (insert into `admins`), confirm admin SELECT works across all users.

**Success:** every table RLS-enabled, policies verified with two test users, trigger confirmed creating profiles on signup.

---

## Phase 3 — Supabase client in frontend

**Goal:** `supabase` client instance available throughout `meta-report`.

**Steps:**
1. `pnpm --filter @workspace/meta-report add @supabase/supabase-js`.
2. Create `artifacts/meta-report/src/lib/supabase.ts`:
   - Export singleton `createClient<Database>(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })`.
   - Read from `import.meta.env.VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Generate TypeScript types from Supabase schema (optional but recommended):
   - `npx supabase gen types typescript --project-id otmtignvjmaqryjywoku > artifacts/meta-report/src/lib/database.types.ts`
   - Reference as `createClient<Database>(...)` for full type safety.
4. Add an npm script `gen:db-types` so it can be re-run after schema changes.

**Success:** a throwaway component can call `await supabase.from('profiles').select()` and get typed results.

---

## Phase 4 — Rewrite auth on Supabase (Clerk still installed)

**Goal:** Supabase auth fully working end-to-end, with Clerk still in tree as fallback so nothing breaks mid-refactor.

**Steps:**
1. **New `AuthContext` (replace `context/AuthContext.tsx`):**
   - Internal state: `session: Session | null`, `user: User | null`, `profile: Profile | null`, `loading: boolean`.
   - On mount: `supabase.auth.getSession()`, set state, subscribe to `onAuthStateChange`.
   - On auth state change, fetch profile from `profiles` table (or rely on trigger + lazy-load).
   - Expose: `signInWithPassword`, `signUp`, `signInWithOAuth(provider)`, `signOut`, `sendMagicLink`.
   - Compute `isLoggedIn`, `isAdmin` (query `admins`), `reportLimit` from `profile.plan`.

2. **Rewrite `hooks/use-auth.ts`** to pull from the new context instead of Clerk's `useUser`/`useClerk`.

3. **New auth UI components** in `src/components/auth/`:
   - `SignInForm.tsx` — email/password + OAuth buttons (Google, Facebook) + magic link toggle.
   - `SignUpForm.tsx` — same, but calls signUp.
   - `AuthModal.tsx` — replaces existing Clerk-redirecting modal. Tabs for sign in / sign up.
   - Styled with existing Radix + Tailwind.

4. **`Account.tsx`** — read from new context, add a "Reset password" flow (Supabase `updateUser`).

5. **Callback/redirect handling:**
   - OAuth providers redirect to `/auth/callback` — add a Wouter route + `<AuthCallback />` component that reads the URL, calls `supabase.auth.exchangeCodeForSession`, redirects to `/`.
   - Password reset: `/auth/reset-password` route + form calling `supabase.auth.updateUser({ password })`.

6. **Smoke test:**
   - Sign up with email/password → check email → click link → land on `/` logged in.
   - Sign out → sign in with Google OAuth → land back logged in.
   - Confirm `profiles` row was auto-created by the trigger.

**Success:** new user flows work end-to-end; existing Clerk flows still untouched.

---

## Phase 5 — Delete Clerk + admin JWT system

**Goal:** Clerk and custom admin JWT code fully removed. Only Supabase remains.

**Frontend deletions:**
- `artifacts/meta-report/src/context/AdminContext.tsx`
- `artifacts/meta-report/src/lib/admin-auth.ts`
- `AdminLoginModal.tsx` and the hidden-dot trigger in Dashboard header
- Remove `ClerkProvider` wrapper from `App.tsx`
- Remove `AdminProvider` wrapper too
- `pnpm remove @clerk/react @clerk/themes` from meta-report

**Backend deletions:**
- `artifacts/api-server/src/lib/admin.ts`
- `/api/auth/admin-login`, `/api/auth/verify`, `/api/auth/admin-logout`, `/api/auth/user` route handlers
- Remove `clerkMiddleware` from `app.ts`
- `pnpm remove @clerk/express jsonwebtoken` from api-server

**Env var cleanup:**
- Delete from everywhere: `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL`, `ADMIN_ACCESS_CODE`, `ADMIN_EMAILS`, `TEST_MODE`.

**Admin UI replacement:**
- Admin indicator in `Account.tsx`: query `admins` table on profile load.
- Admin-only features (if any beyond the UI badge) gated by `useAdmin()` hook reading from context.
- To grant admin: insert row into `admins` manually via SQL (or build a tiny admin page later).

**Success:** no references to `@clerk/*` in grep, no references to `admin-auth` or `AdminContext`, typecheck clean.

---

## Phase 6 — Slim the Express server

**Goal:** Express server reduced to essentials, ready to host Stripe webhooks + PDF generation when those features land.

**Steps:**
1. Remove all auth routes (already deleted in Phase 5).
2. Remove `/api/users/me` route — frontend uses Supabase directly now.
3. Keep only `/api/healthz`.
4. Replace Clerk middleware with a Supabase JWT verification middleware **scaffold** (not activated yet):
   - `src/middleware/supabase-auth.ts` — verifies `Authorization: Bearer <supabase-jwt>` using Supabase's JWT secret (`SUPABASE_JWT_SECRET` env var from Project Settings → API).
   - Not used on any route yet, but will be needed for webhook signature checks and PDF endpoints.
5. Update build script if needed — esbuild externals list can shrink.

**Decision point:** if Vercel serverless is confirmed for deploy, we can rewrite this as a Vercel API route in `api/` folder at root and delete the whole `artifacts/api-server` workspace. Proposal: do this in Phase 9, not now — cleaner to keep Express working through the refactor.

**Success:** `curl http://localhost:3000/api/healthz` returns ok, nothing else.

---

## Phase 7 — Delete codegen pipeline

**Goal:** remove the now-useless OpenAPI/Orval setup.

**Steps:**
1. Delete workspaces:
   - `rm -rf lib/api-spec lib/api-zod lib/api-client-react`
2. Remove from `pnpm-workspace.yaml`.
3. Remove imports in `artifacts/meta-report`:
   - Any `import { useHealthCheck, useGetMe, useUpsertMe } from '@workspace/api-client-react'` — these were wired but possibly unused.
   - If health check is displayed in UI, keep a manual fetch to `/api/healthz`.
4. Remove project references to these libs from root `tsconfig.json`.
5. `pnpm install` to update lockfile.

**Success:** `pnpm run typecheck` clean, no references to removed packages.

---

## Phase 8 — Freemium enforcement via RLS

**Goal:** report limits enforced server-side, not in localStorage.

**Steps:**
1. Upload flow (in Dashboard.tsx) now saves to `reports` table after parsing:
   ```ts
   const { error } = await supabase.from('reports').insert({
     filename: file.name,
     analysis: parsed.analysis,
     summary: parsed.summary,
     date_range: parsed.dateRange,
   });
   ```
   RLS `can_create_report()` policy blocks insert if over limit → error surfaces to UI.
2. Usage increment: either via trigger on `reports` insert, or via `.rpc('increment_usage')` after successful insert. Prefer trigger — atomic with the insert.
3. Delete localStorage count logic from `AuthContext`.
4. UI:
   - When insert fails with limit error, show the existing `UpgradeModal`.
   - Display current usage: "2 of 3 reports this month" pulled from `usage` table.
5. Report history list on Dashboard (or new `/reports` page): `supabase.from('reports').select().order('uploaded_at', { ascending: false })`.
6. Retention policy (Basic: 30 days): nightly Supabase cron (`pg_cron` extension) deleting reports older than 30 days for Basic plans. Defer to when Basic plan exists.

**Success:** a free user inserting a 4th report in one month gets a 403-equivalent RLS error; the UpgradeModal appears.

---

## Phase 9 — Deploy on Vercel, decommission Replit

**Goal:** production deployment on Vercel auto-deploying from GitHub main branch.

**Steps:**
1. **Restructure for Vercel:**
   - Option A (recommended): `meta-report` builds to static `dist/public/`, Vercel serves as static site. The Express `/healthz` + future webhooks move to `api/` folder at repo root as Vercel serverless functions. Delete `artifacts/api-server` workspace.
   - Option B: keep `api-server` as a Node serverless function via `@vercel/node`. More moving parts.
   - Go with A.
2. Create `vercel.json` at root:
   - `buildCommand`: `pnpm run build`
   - `outputDirectory`: `artifacts/meta-report/dist/public`
   - Rewrites: `/api/*` → Vercel functions in `api/`
   - SPA fallback: everything else → `/index.html`
3. Move `/healthz` to `api/healthz.ts` as a Vercel function.
4. Connect GitHub repo in Vercel dashboard.
5. Set env vars in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL`.
6. Update Supabase auth Site URL and redirect URLs to the Vercel prod URL (and preview URL pattern `https://*-<org>.vercel.app` for preview deploys).
7. Custom domain (optional): point domain DNS at Vercel.
8. Verify prod deploy: sign up, upload a report, check RLS enforcement.
9. Delete `.replit`, `.replitignore`.
10. Delete `scripts/post-merge.sh` if it was Replit-specific.

**Success:** pushing to GitHub main triggers a Vercel deploy, app works end-to-end in prod, no Replit references remain.

---

## Phase 10 — Cleanup & docs

**Goal:** repo is tidy, documented, ready for ongoing dev.

**Steps:**
1. Update `replit.md` → rename to `README.md`, rewrite for Vercel + Supabase.
2. Update `.env.example` with the new env var list.
3. Add a short `docs/architecture.md` explaining: RLS model, where auth lives, how to run locally.
4. Consider adding a minimal test setup (Vitest) — at least test the Excel parser + analysis generation.
5. Delete dead code spotted during migration (`artifacts/saas-starter` and `artifacts/mockup-sandbox` — unused? confirm first).
6. Regenerate `database.types.ts` one final time to match live schema.
7. Rotate Supabase keys if any ended up in git history during the transition (unlikely if `.gitignore` was clean from Phase 0).

**Success:** a new developer could clone, `pnpm install`, copy `.env.example` to `.env.local`, get the app running in <5 minutes.

---

## Env var inventory (end state)

| Var | Scope | Source |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | Supabase API settings |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | server (Vercel fn) | Supabase API settings |
| `SUPABASE_JWT_SECRET` | server (Vercel fn) | Supabase API settings |
| `DATABASE_URL` | Drizzle migrations | Supabase Connection string, session mode 5432 |

All Clerk, admin JWT, Replit-specific vars are gone.

---

## Dependencies between phases

```
Phase 0 (git) ──┐
                ├─→ Phase 1 (supabase config) ──→ Phase 2 (schema) ──→ Phase 3 (supabase client)
                │                                                            │
                │                                                            ↓
                │                                                    Phase 4 (auth rewrite)
                │                                                            │
                │                                                            ↓
                │                                                    Phase 5 (delete Clerk)
                │                                                            │
                │                                                            ↓
                │                                                    Phase 6 (slim Express)
                │                                                            │
                │                                                            ↓
                │                                                    Phase 7 (delete codegen)
                │                                                            │
                │                                                            ↓
                │                                                    Phase 8 (freemium RLS)
                │                                                            │
                └────────────────────────────────────────────────────→ Phase 9 (Vercel)
                                                                             │
                                                                             ↓
                                                                     Phase 10 (cleanup)
```

Phases 4 → 8 should each land as a separate commit/PR. Phases 2 and 8 have the highest risk (RLS correctness). Do the two-user security test at end of Phase 2 and end of Phase 8.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| RLS policy leaks user data | Default-deny, two-user manual test after every RLS file, admin read policies added last |
| Trigger fails on signup → user without profile | `handle_new_user` wrapped in exception handler; nightly SQL audit script to find orphan auth.users |
| Supabase JWT verification wrong in Express middleware | Defer until actually needed (phase 9 Stripe work); until then, no server auth |
| Secrets leak into git | `.gitignore` audit in Phase 0, `git-secrets` or similar pre-commit hook optional |
| Drizzle push drops data during schema change | Pre-launch, no data to lose — but once live, switch to versioned migrations via `drizzle-kit generate` instead of `push` |
| Dev/prod Supabase confusion | Separate Supabase projects for dev and prod from Phase 9 onward; `.env.local` vs Vercel env |

---

## Execution protocol

Work one phase at a time. At the end of each phase:
1. Verify the stated success criteria.
2. Commit the changes (once Phase 0 is done).
3. Stop and report status before starting the next phase.

For the Supabase-MCP-enabled session: read `~/.claude/projects/-Users-jordonharrod-Desktop-AdClarity-master/memory/MEMORY.md` first for full codebase context, then start at Phase 0.
