-- 003: auto-create a profiles row whenever a new auth.users row is inserted.
-- Reads email + name metadata (first_name, last_name, avatar_url, name, picture)
-- from raw_user_meta_data (OAuth) or raw_app_meta_data, falling back gracefully.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'given_name'), ''),
    nullif(coalesce(new.raw_user_meta_data->>'last_name',  new.raw_user_meta_data->>'family_name'), ''),
    nullif(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), '')
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  -- Never let a profile-creation failure block signup.
  -- Orphaned auth.users rows can be reconciled by a nightly audit.
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
