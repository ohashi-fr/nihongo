-- =========================================================
-- Nihongo — Leitner spaced-review for custom decks
-- =========================================================
-- One row per (user, custom_card) once the user has rated the
-- card at least once. Absence of a row means the card is "new"
-- and hasn't been touched yet — we never pre-create rows.
--
-- Kept deliberately separate from `card_reviews` (which is
-- disconnected FSRS scaffolding for the seeded modules).
--
-- Idempotent — safe to re-run.
-- =========================================================

create table if not exists custom_card_reviews (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  custom_card_id   uuid not null references custom_cards(id) on delete cascade,
  box              smallint not null default 1 check (box between 1 and 5),
  due_date         date not null default current_date,
  last_reviewed_at timestamptz,
  lapses           int not null default 0,
  created_at       timestamptz not null default now(),
  unique (user_id, custom_card_id)
);

-- Two hot query paths:
--   * "what's due today for this user, joined to a deck?" — driven
--     by (user_id, due_date) with the join filtering by card.
--   * cascade-on-delete FK lookups on custom_card_id.
create index if not exists idx_ccr_user_due
  on custom_card_reviews (user_id, due_date);
create index if not exists idx_ccr_custom_card
  on custom_card_reviews (custom_card_id);

alter table custom_card_reviews enable row level security;

drop policy if exists "users select own ccr" on custom_card_reviews;
create policy "users select own ccr"
  on custom_card_reviews for select
  using (user_id = auth.uid());

-- INSERT must satisfy both: the row is mine AND the underlying
-- custom_card belongs to me. Without the second clause a client
-- could plant a review row under someone else's card.
drop policy if exists "users insert own ccr" on custom_card_reviews;
create policy "users insert own ccr"
  on custom_card_reviews for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from custom_cards c
      where c.id = custom_card_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "users update own ccr" on custom_card_reviews;
create policy "users update own ccr"
  on custom_card_reviews for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from custom_cards c
      where c.id = custom_card_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "users delete own ccr" on custom_card_reviews;
create policy "users delete own ccr"
  on custom_card_reviews for delete
  using (user_id = auth.uid());
