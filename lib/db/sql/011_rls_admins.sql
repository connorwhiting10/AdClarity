-- 011: RLS for admins.
-- Only admins can read the admins table. Writes are service_role only.

alter table public.admins enable row level security;
alter table public.admins force row level security;

drop policy if exists admins_select_admin on public.admins;

create policy admins_select_admin
  on public.admins for select
  to authenticated
  using (public.is_admin(auth.uid()));
