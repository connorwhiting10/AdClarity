-- 013: RLS for usage.
-- Users read their own counts; admins read all; writes only via the report-insert trigger
-- (SECURITY DEFINER) or service_role. Anon/authenticated have no insert/update/delete privilege.

alter table public.usage enable row level security;
alter table public.usage force row level security;

drop policy if exists usage_select_self      on public.usage;
drop policy if exists usage_select_admin_all on public.usage;

create policy usage_select_self
  on public.usage for select
  to authenticated
  using (user_id = auth.uid());

create policy usage_select_admin_all
  on public.usage for select
  to authenticated
  using (public.is_admin(auth.uid()));

revoke insert, update, delete on public.usage from anon, authenticated;
