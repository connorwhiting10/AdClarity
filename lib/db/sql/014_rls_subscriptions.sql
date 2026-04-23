-- 014: RLS for subscriptions.
-- Users read their own; admins read all; writes are service_role only (Stripe webhooks).

alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;

drop policy if exists subscriptions_select_self      on public.subscriptions;
drop policy if exists subscriptions_select_admin_all on public.subscriptions;

create policy subscriptions_select_self
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy subscriptions_select_admin_all
  on public.subscriptions for select
  to authenticated
  using (public.is_admin(auth.uid()));

revoke insert, update, delete on public.subscriptions from anon, authenticated;
