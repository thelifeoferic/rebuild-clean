create extension if not exists pgcrypto;

create table if not exists public.rebuild_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  avatar_url text,
  first_name text,
  goal text not null default 'Rebuild discipline',
  goals text[] not null default '{}',
  theme_preference text not null default 'dark',
  accent_color text not null default 'champagne',
  coaching_tone text not null default 'calm',
  quote_style text not null default 'goggins',
  preferred_training_minutes integer not null default 25,
  default_location text not null default 'gym',
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

alter table public.rebuild_profiles add column if not exists theme_preference text not null default 'dark';
alter table public.rebuild_profiles add column if not exists avatar_url text;
alter table public.rebuild_profiles add column if not exists accent_color text not null default 'champagne';
alter table public.rebuild_profiles alter column accent_color set default 'champagne';
alter table public.rebuild_profiles add column if not exists coaching_tone text not null default 'calm';
alter table public.rebuild_profiles add column if not exists quote_style text not null default 'goggins';
alter table public.rebuild_profiles add column if not exists preferred_training_minutes integer not null default 25;
alter table public.rebuild_profiles add column if not exists default_location text not null default 'gym';

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
