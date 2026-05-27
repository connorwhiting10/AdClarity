-- 005: freemium check used by the reports-insert RLS policy.
-- Free: 3 reports/month. Basic + Pro: unlimited.

create or replace function public.can_create_report(uid uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p public.plan_enum;
  used integer;
  m date := date_trunc('month', now())::date;
  free_monthly_limit constant integer := 3;
begin
  if uid is null then return false; end if;

  select plan into p from public.profiles where id = uid;
  if p is null then return false; end if;

  if p in ('basic', 'pro') then return true; end if;

  select coalesce(report_count, 0) into used
    from public.usage where user_id = uid and month = m;

  return coalesce(used, 0) < free_monthly_limit;
end;
$$;

revoke all on function public.can_create_report(uuid) from public;
grant execute on function public.can_create_report(uuid) to anon, authenticated, service_role;
