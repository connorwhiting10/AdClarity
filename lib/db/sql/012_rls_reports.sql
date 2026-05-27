-- 012: RLS for reports.
-- Users see/delete their own; admins see all; inserts gated by can_create_report.

alter table public.reports enable row level security;
alter table public.reports force row level security;

drop policy if exists reports_select_self       on public.reports;
drop policy if exists reports_select_admin_all  on public.reports;
drop policy if exists reports_insert_self       on public.reports;
drop policy if exists reports_delete_self       on public.reports;
drop policy if exists reports_delete_admin_all  on public.reports;

create policy reports_select_self
  on public.reports for select
  to authenticated
  using (user_id = auth.uid());

create policy reports_select_admin_all
  on public.reports for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy reports_insert_self
  on public.reports for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_create_report(auth.uid())
  );

create policy reports_delete_self
  on public.reports for delete
  to authenticated
  using (user_id = auth.uid());

create policy reports_delete_admin_all
  on public.reports for delete
  to authenticated
  using (public.is_admin(auth.uid()));
