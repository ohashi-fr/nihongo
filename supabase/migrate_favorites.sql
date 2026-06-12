-- =========================================================
-- Nihongo — favorites table (manual review list)
-- Replaces the previous FSRS-driven /reviews queue with a
-- per-user bookmark of card_ids. Independent from card_reviews,
-- which we keep around so spaced repetition can be re-enabled
-- later without a schema migration.
-- Idempotent.
-- =========================================================

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, card_id)
);

-- Lookup index for the "what have I starred?" query.
create index if not exists idx_favorites_user
  on favorites (user_id, created_at);

-- =========================================================
-- Row-Level Security — a user can only see / write their own rows.
-- =========================================================
alter table favorites enable row level security;

drop policy if exists "users read own favorites"   on favorites;
drop policy if exists "users insert own favorites" on favorites;
drop policy if exists "users delete own favorites" on favorites;

create policy "users read own favorites" on favorites
  for select using (auth.uid() = user_id);

create policy "users insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "users delete own favorites" on favorites
  for delete using (auth.uid() = user_id);

-- Sanity check
select
  to_regclass('public.favorites') is not null as table_exists,
  (select count(*) from pg_policies where tablename = 'favorites') as policy_count;
