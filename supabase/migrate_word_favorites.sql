-- =========================================================
-- Nihongo — allow favoriting word-level "cards" (Kanji Words mode)
-- =========================================================
-- The Kanji flashcard client's new "Words" mode flattens each
-- kanji's `fields.examples[]` into its own flip-card. Those word
-- cards don't have a row in `cards` (they live inside the parent
-- kanji card's JSON), so they need a synthetic id — see
-- `wordCardId()` in components/KanjiQuizClient.tsx, which derives a
-- stable uuid-shaped id from the parent kanji card's real id plus
-- the word's index.
--
-- `favorites.card_id` currently has a hard FK to `cards(id)`, which
-- rejects any id that isn't a real card row — including these
-- synthetic word ids. Drop it so `favorites` becomes a generic
-- "starred id" bag; RLS (owner-only read/write) already provides
-- the actual data-integrity boundary that matters here.
--
-- Trade-off: favoriting a *kanji* card no longer cascade-deletes its
-- favorite row if the card itself is deleted (rare — kanji cards are
-- static seed data, never deleted in normal use).
--
-- Idempotent — safe to re-run.
-- =========================================================

alter table favorites
  drop constraint if exists favorites_card_id_fkey;

-- Sanity check — should return 0 rows (no FK left on card_id).
select conname
from pg_constraint
where conrelid = 'favorites'::regclass
  and conname = 'favorites_card_id_fkey';
