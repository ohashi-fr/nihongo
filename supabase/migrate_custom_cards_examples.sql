-- =========================================================
-- Nihongo — Example-sentence columns on custom_cards
-- =========================================================
-- Four new columns to store an example directly on each custom
-- card (instead of looking it up on every render). Populated:
--
--   * on card creation, by AddCardForm calling `pick_best_example`
--   * on backfill, by `supabase/backfill_custom_cards_examples.sql`
--   * NEVER regenerated on card edit — editing content leaves
--     the example alone even if the kanji/reading changes.
--
-- RLS on custom_cards already covers reads + writes (owner-only).
-- Idempotent — safe to re-run.
-- =========================================================

alter table custom_cards
  add column if not exists example_jp      text;
alter table custom_cards
  add column if not exists example_en      text;
alter table custom_cards
  add column if not exists example_reading text;
alter table custom_cards
  add column if not exists example_source  text;
