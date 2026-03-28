-- Run in Supabase SQL Editor. Adjust if tables already exist.
-- If wardrobe_items references profiles(id), run optional_profiles.sql too.

-- Wardrobe items (RLS: users own rows)
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  image_url text not null,
  user_notes text,
  created_at timestamptz not null default now()
);

create index if not exists wardrobe_items_user_id_idx on public.wardrobe_items (user_id);

alter table public.wardrobe_items enable row level security;

create policy "wardrobe_items_select_own" on public.wardrobe_items
  for select using (auth.uid() = user_id);

create policy "wardrobe_items_insert_own" on public.wardrobe_items
  for insert with check (auth.uid() = user_id);

create policy "wardrobe_items_update_own" on public.wardrobe_items
  for update using (auth.uid() = user_id);

create policy "wardrobe_items_delete_own" on public.wardrobe_items
  for delete using (auth.uid() = user_id);

-- Saved AI suggestions
create table if not exists public.outfit_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text,
  name text not null,
  item_ids uuid[] not null default '{}',
  styling_tip text,
  accessories_needed text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists outfit_suggestions_user_id_idx on public.outfit_suggestions (user_id);

alter table public.outfit_suggestions enable row level security;

create policy "outfit_suggestions_select_own" on public.outfit_suggestions
  for select using (auth.uid() = user_id);

create policy "outfit_suggestions_insert_own" on public.outfit_suggestions
  for insert with check (auth.uid() = user_id);

create policy "outfit_suggestions_delete_own" on public.outfit_suggestions
  for delete using (auth.uid() = user_id);

-- Public waitlist (Early Access)
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now(),
  source text default 'early-access-page'
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

-- Storage: Dashboard → Storage → New bucket → name: wardrobe → Public bucket
-- (app uses getPublicUrl for wardrobe photos).

-- Policies on storage.objects (replace if your UI already created policies):
/*
create policy "wardrobe_read_own"
on storage.objects for select
using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "wardrobe_insert_own"
on storage.objects for insert
with check (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "wardrobe_delete_own"
on storage.objects for delete
using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
*/
