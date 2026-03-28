-- Use when wardrobe_items (or other tables) reference public.profiles(id).
-- The app upserts profiles(id) before each wardrobe insert.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Freemium plan / usage tracking (default Free)
alter table public.profiles
  add column if not exists plan text default 'free',
  add column if not exists suggestions_count int default 0,
  add column if not exists wardrobe_count int default 0;
