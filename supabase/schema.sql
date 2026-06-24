create extension if not exists pgcrypto;

create table if not exists public.rebuild_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  first_name text,
  goal text not null default 'Rebuild discipline',
  goals text[] not null default '{}',
  current_weight numeric,
  target_weight numeric,
  height text,
  why text,
  equipment text[] not null default '{}',
  behavior_focus text[] not null default '{}',
  reset_plan text,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rebuild_data_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_rebuild_profiles_updated_at on public.rebuild_profiles;
create trigger set_rebuild_profiles_updated_at
before update on public.rebuild_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_rebuild_data_snapshots_updated_at on public.rebuild_data_snapshots;
create trigger set_rebuild_data_snapshots_updated_at
before update on public.rebuild_data_snapshots
for each row execute function public.set_updated_at();

alter table public.rebuild_profiles enable row level security;
alter table public.rebuild_data_snapshots enable row level security;

drop policy if exists "Users can read own rebuild profile" on public.rebuild_profiles;
create policy "Users can read own rebuild profile"
on public.rebuild_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own rebuild profile" on public.rebuild_profiles;
create policy "Users can insert own rebuild profile"
on public.rebuild_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own rebuild profile" on public.rebuild_profiles;
create policy "Users can update own rebuild profile"
on public.rebuild_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own rebuild profile" on public.rebuild_profiles;
create policy "Users can delete own rebuild profile"
on public.rebuild_profiles
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own rebuild data" on public.rebuild_data_snapshots;
create policy "Users can read own rebuild data"
on public.rebuild_data_snapshots
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own rebuild data" on public.rebuild_data_snapshots;
create policy "Users can insert own rebuild data"
on public.rebuild_data_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own rebuild data" on public.rebuild_data_snapshots;
create policy "Users can update own rebuild data"
on public.rebuild_data_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own rebuild data" on public.rebuild_data_snapshots;
create policy "Users can delete own rebuild data"
on public.rebuild_data_snapshots
for delete
to authenticated
using (auth.uid() = user_id);
