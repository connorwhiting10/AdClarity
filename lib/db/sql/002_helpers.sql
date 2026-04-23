-- 002: helper functions used by RLS policies.

-- is_admin: true if uid is in admins table.
-- SECURITY DEFINER so it can read admins regardless of caller's RLS.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

-- current_user_plan: plan for auth.uid(), defaulting to 'free'.
create or replace function public.current_user_plan()
returns public.plan_enum
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select plan from public.profiles where id = auth.uid()), 'free'::public.plan_enum);
$$;

revoke all on function public.current_user_plan() from public;
grant execute on function public.current_user_plan() to anon, authenticated, service_role;
