-- =========================================================
-- Nihongo — Custom deck: illustration + last_used_at
-- =========================================================
-- Extends `custom_decks` with:
--   * `illustration text default 'zen-garden.png'`
--     Filename (in /public/icons/) of the deck's cover art.
--     Values are chosen from the library in `lib/deckIllustrations.ts`.
--   * `last_used_at timestamptz`
--     Set to now() by a trigger whenever a card is added to the deck.
--     Powers the mobile bottom-nav "Add card" flow, which pre-selects
--     the most-recently-used deck.
--
-- Rationale for the timestamp column (over deriving it from
-- max(custom_cards.created_at)):
--   * One extra column beats an aggregate on every mobile bottom-nav
--     tap. Also survives card deletions cleanly — "you used this deck
--     yesterday" stays true even if you delete cards afterwards.
--   * A trigger keeps it maintained without app-side discipline; even
--     admin-inserted rows update it.
--
-- Idempotent — safe to re-run.
-- =========================================================

alter table custom_decks
  add column if not exists illustration text
    default 'zen-garden.png';

alter table custom_decks
  add column if not exists last_used_at timestamptz;

-- Backfill last_used_at for existing decks that already have cards
-- so ordering makes sense on first render post-migration. Uses each
-- deck's newest card timestamp, and falls back to the deck creation
-- time when the deck is empty.
update custom_decks d
  set last_used_at = coalesce(
    (select max(c.created_at) from custom_cards c where c.deck_id = d.id),
    d.created_at
  )
  where d.last_used_at is null;

-- Trigger: bump the parent deck's last_used_at whenever a card is
-- inserted. Runs as security invoker; the row-level policies on
-- custom_decks already require ownership, and since the insert on
-- custom_cards already verified the deck belongs to the caller,
-- the update passes cleanly.
create or replace function bump_deck_last_used()
returns trigger
language plpgsql
as $$
begin
  update custom_decks
    set last_used_at = now()
    where id = new.deck_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_deck_last_used on custom_cards;
create trigger trg_bump_deck_last_used
  after insert on custom_cards
  for each row execute function bump_deck_last_used();
