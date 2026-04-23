-- 004: on reports insert, upsert monthly usage count atomically.
-- usage table is never written directly by clients (blocked by RLS);
-- this trigger is the only mutator outside service_role.

create or replace function public.bump_usage_on_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m date := date_trunc('month', new.uploaded_at)::date;
begin
  insert into public.usage (user_id, month, report_count)
  values (new.user_id, m, 1)
  on conflict (user_id, month) do update
    set report_count = public.usage.report_count + 1;
  return new;
end;
$$;

drop trigger if exists on_report_insert_bump_usage on public.reports;
create trigger on_report_insert_bump_usage
  after insert on public.reports
  for each row execute function public.bump_usage_on_report();
