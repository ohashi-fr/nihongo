-- =========================================================
-- Nihongo — User-authored custom decks
-- =========================================================
-- `custom_decks`  : named containers, one row per user-created deck.
-- `custom_cards`  : the cards inside those decks. `user_id` is
--                   denormalised (also present on the parent deck)
--                   so RLS policies stay a single row-level check
--                   instead of joining through the deck on every read.
--
-- RLS: each user CRUDs only their own rows.
-- Insert/update on `custom_cards` additionally verifies the target
-- deck is owned by the same user, so nobody can attach a card to
-- someone else's deck by supplying a spoofed `deck_id` at insert.
--
-- Idempotent — safe to re-run.
-- =========================================================

-- ---------------------------------------------------------
-- Tables
-- ---------------------------------------------------------
create table if not exists custom_decks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

create index if not exists idx_custom_decks_user_id
  on custom_decks (user_id);

create table if not exists custom_cards (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references custom_decks(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kanji      text,
  reading    text not null,     -- hiragana, shown first on the review card
  meaning_en text not null,
  note       text,              -- optional personal note ("seen at the station")
  created_at timestamptz default now()
);

create index if not exists idx_custom_cards_deck_id
  on custom_cards (deck_id);
create index if not exists idx_custom_cards_user_id
  on custom_cards (user_id);

-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------
alter table custom_decks enable row level security;
alter table custom_cards enable row level security;

-- --- custom_decks ---------------------------------------------------
drop policy if exists "users select own decks" on custom_decks;
create policy "users select own decks"
  on custom_decks for select
  using (user_id = auth.uid());

drop policy if exists "users insert own decks" on custom_decks;
create policy "users insert own decks"
  on custom_decks for insert
  with check (user_id = auth.uid());

drop policy if exists "users update own decks" on custom_decks;
create policy "users update own decks"
  on custom_decks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users delete own decks" on custom_decks;
create policy "users delete own decks"
  on custom_decks for delete
  using (user_id = auth.uid());

-- --- custom_cards ---------------------------------------------------
drop policy if exists "users select own cards" on custom_cards;
create policy "users select own cards"
  on custom_cards for select
  using (user_id = auth.uid());

-- Insert must satisfy BOTH: the row is mine, AND the deck it lands
-- in is mine. Without the second clause a client could POST a card
-- with user_id = self but deck_id = someone_else's_deck, littering a
-- victim's deck view.
drop policy if exists "users insert own cards" on custom_cards;
create policy "users insert own cards"
  on custom_cards for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from custom_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

-- Same shape on update — the row must stay mine, and if the client
-- tries to move the card into a different deck, that deck must also
-- be mine.
drop policy if exists "users update own cards" on custom_cards;
create policy "users update own cards"
  on custom_cards for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from custom_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "users delete own cards" on custom_cards;
create policy "users delete own cards"
  on custom_cards for delete
  using (user_id = auth.uid());
