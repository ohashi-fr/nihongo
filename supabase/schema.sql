-- =========================================================
-- Nihongo — schema
-- Run this in your Supabase SQL editor (project → SQL).
-- =========================================================

-- Modules (e.g., Vocabulary, Conjugation)
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  type text check (type in ('quiz', 'conjugation')) default 'quiz',
  created_at timestamp default now()
);

-- Levels inside each module (e.g., Level 1)
create table if not exists module_levels (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  name text not null,
  order_index int default 0,
  script text check (script in ('hiragana','katakana','both','none')) default 'both',
  created_at timestamp default now()
);

-- Cards — JSONB fields adapt to any module type
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references module_levels(id) on delete cascade,
  fields jsonb not null,
  created_at timestamp default now()
);

-- Sessions (score tracking per level)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references module_levels(id) on delete cascade,
  total_cards int,
  correct_first_try int,
  completed_at timestamp default now()
);

create index if not exists idx_levels_module on module_levels(module_id);
create index if not exists idx_cards_level on cards(level_id);
create index if not exists idx_sessions_level on sessions(level_id);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table modules        enable row level security;
alter table module_levels  enable row level security;
alter table cards          enable row level security;
alter table sessions       enable row level security;

-- Public read: anyone can see modules / levels / cards.
drop policy if exists "modules read"  on modules;
drop policy if exists "levels read"   on module_levels;
drop policy if exists "cards read"    on cards;
create policy "modules read" on modules        for select using (true);
create policy "levels read"  on module_levels  for select using (true);
create policy "cards read"   on cards          for select using (true);

-- Public write only on sessions: anonymous users can record their score.
drop policy if exists "sessions insert"  on sessions;
drop policy if exists "sessions read"    on sessions;
create policy "sessions insert" on sessions for insert with check (true);
create policy "sessions read"   on sessions for select using (true);

-- Authenticated users (admins) can write modules / levels / cards.
drop policy if exists "modules write"  on modules;
drop policy if exists "levels write"   on module_levels;
drop policy if exists "cards write"    on cards;
create policy "modules write" on modules
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "levels write" on module_levels
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "cards write" on cards
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =========================================================
-- Base table privileges
-- =========================================================
-- RLS policies above only decide which ROWS a role can see/touch —
-- they don't grant the role access to the TABLE itself. New Supabase
-- projects get that base grant automatically, but it's not guaranteed
-- (and can be revoked), so we set it explicitly here. Without this,
-- queries fail with "permission denied for table X" before RLS is
-- even evaluated. Safe to re-run — GRANT is idempotent.
grant usage on schema public to anon, authenticated;
grant select on modules, module_levels, cards, sessions to anon, authenticated;
grant insert, update, delete on modules, module_levels, cards to authenticated;
grant insert on sessions to anon, authenticated;
