-- =========================================================
-- Nihongo — Coverage report for example sentences
-- =========================================================
-- Run in Supabase SQL Editor to see how many cards got an
-- example after ingestion + backfill. Numbers by type:
--   * noun_flashcard
--   * verb_flashcard
--   * adjective_flashcard
--   * custom_cards
--
-- The three excluded card types (kanji_flashcard,
-- verb_conjugation, counting cards) are NOT in this report by
-- design — they don't get example sentences.
-- =========================================================

-- ── Seeded vocab: nouns / verbs / adjectives ─────────────────
select fields->>'card_type' as card_type,
       count(*) filter (where fields ? 'example')  as with_example,
       count(*) filter (where not (fields ? 'example')) as without_example,
       count(*) as total,
       round(
         100.0 * count(*) filter (where fields ? 'example') / nullif(count(*), 0),
         1
       ) as coverage_pct
  from cards
 where fields->>'card_type' in (
   'noun_flashcard', 'verb_flashcard', 'adjective_flashcard'
 )
 group by fields->>'card_type'
 order by card_type;

-- ── Custom cards (all users, service-role only) ──────────────
select 'custom_cards' as card_type,
       count(*) filter (where example_jp is not null) as with_example,
       count(*) filter (where example_jp is null)     as without_example,
       count(*) as total,
       round(
         100.0 * count(*) filter (where example_jp is not null) / nullif(count(*), 0),
         1
       ) as coverage_pct
  from custom_cards;

-- ── Rows in dictionary_examples table ────────────────────────
select 'dictionary_examples' as what, count(*) as row_count
  from dictionary_examples;
