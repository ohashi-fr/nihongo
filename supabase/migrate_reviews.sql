-- =========================================================
-- Nihongo — FSRS card_reviews table (Phase 2)
-- Per-user, per-card scheduling state. Idempotent: drops and
-- re-creates the policies in case they pre-exist with the same
-- names from an earlier run.
-- =========================================================

create table if not exists card_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  due timestamptz not null default now(),
  stability double precision,
  difficulty double precision,
  elapsed_days double precision default 0,
  scheduled_days double precision default 0,
  reps int default 0,
  lapses int default 0,
  state int default 0,          -- 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review timestamptz,
  created_at timestamptz default now(),
  unique (user_id, card_id)
);

-- Helpful lookup index for the "what's due" query.
create index if not exists idx_card_reviews_user_due
  on card_reviews (user_id, due);

-- =========================================================
-- Row-Level Security — a user can only see / write their own rows.
-- =========================================================
alter table card_reviews enable row level security;

drop policy if exists "users read own reviews"   on card_reviews;
drop policy if exists "users insert own reviews" on card_reviews;
drop policy if exists "users update own reviews" on card_reviews;

create policy "users read own reviews" on card_reviews
  for select using (auth.uid() = user_id);

create policy "users insert own reviews" on card_reviews
  for insert with check (auth.uid() = user_id);

create policy "users update own reviews" on card_reviews
  for update using (auth.uid() = user_id);

-- Sanity check
select
  to_regclass('public.card_reviews') is not null as table_exists,
  (select count(*) from pg_policies where tablename = 'card_reviews') as policy_count;
