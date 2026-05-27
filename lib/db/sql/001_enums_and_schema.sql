-- 001: plan enum + all tables + FKs + indexes.
-- Applied first. Drizzle schema in lib/db/src/schema/ mirrors this for type inference.

-- Enum
do $$ begin
  create type public.plan_enum as enum ('free', 'basic', 'pro');
exception when duplicate_object then null; end $$;

-- profiles: 1:1 with auth.users
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  first_name   text,
  last_name    text,
  avatar_url   text,
  plan         public.plan_enum not null default 'free',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- admins: presence = admin
create table if not exists public.admins (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- reports: user uploads
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  filename     text,
  uploaded_at  timestamptz not null default now(),
  analysis     jsonb,
  summary      jsonb,
  date_range   text
);
create index if not exists reports_user_uploaded_idx
  on public.reports (user_id, uploaded_at desc);

-- usage: monthly counts per user
create table if not exists public.usage (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  month         date not null,
  report_count  integer not null default 0,
  primary key (user_id, month)
);

-- subscriptions: Stripe state
create table if not exists public.subscriptions (
  user_id                 uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  plan                    public.plan_enum,
  status                  text,
  current_period_end      timestamptz,
  updated_at              timestamptz not null default now()
);
