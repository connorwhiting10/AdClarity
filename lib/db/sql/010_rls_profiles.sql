-- 010: RLS for profiles.
-- Rows are created by the handle_new_user trigger (SECURITY DEFINER bypasses RLS),
-- so no INSERT policy is needed for regular users. Deletion cascades from auth.users.

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists profiles_select_self      on public.profiles;
drop policy if exists profiles_update_self      on public.profiles;
drop policy if exists profiles_select_admin_all on public.profiles;

create policy profiles_select_self
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy profiles_update_self
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_select_admin_all
  on public.profiles for select
  to authenticated
  using (public.is_admin(auth.uid()));
