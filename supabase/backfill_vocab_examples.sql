-- =========================================================
-- Nihongo — Backfill fields.example on the seeded vocab cards
-- =========================================================
-- One-shot. Idempotent — skips cards that already carry
-- fields.example. Only touches the three vocab card types in
-- scope: noun_flashcard, verb_flashcard, adjective_flashcard.
--
-- Explicitly NOT touched:
--   * kanji_flashcard  — kanji don't get sentence examples here
--   * verb_conjugation — reference cards, not vocab
--   * counting cards   — no headword to look up
--
-- Field-name mapping (differs slightly across the three types):
--   noun_flashcard      : japanese  / hiragana
--   verb_flashcard      : kanji     / hiragana
--   adjective_flashcard : kanji     / hiragana
--
-- After running this, inspect coverage with:
--   see supabase/coverage_examples.sql
--
-- Prerequisites:
--   * migrate_dictionary_examples.sql applied
--   * dictionary_examples populated by scripts/ingest_tatoeba_examples.mjs
-- =========================================================

-- ── 1) Nouns ─────────────────────────────────────────────────
with matches as (
  select c.id,
         pbe.jp_text,
         pbe.en_text,
         pbe.reading,
         pbe.source
    from cards c
    cross join lateral pick_best_example(
      c.fields->>'japanese',
      c.fields->>'hiragana'
    ) pbe
   where c.fields->>'card_type' = 'noun_flashcard'
     and not (c.fields ? 'example')
     and pbe.jp_text is not null
)
update cards c
   set fields = c.fields || jsonb_build_object(
         'example',
         jsonb_build_object(
           'jp', m.jp_text,
           'en', m.en_text,
           'reading', m.reading,
           'source', m.source
         )
       )
  from matches m
 where c.id = m.id;

-- ── 2) Verbs ─────────────────────────────────────────────────
-- Verb cards store the head as `dictionary_form` = "歩く (あるく)"
-- (kanji + reading in parens) OR just "あるく" for kana-only verbs.
-- Extract both halves and hand them to pick_best_example.
with matches as (
  select c.id,
         pbe.jp_text,
         pbe.en_text,
         pbe.reading,
         pbe.source
    from cards c
    cross join lateral (
      select
        case
          when c.fields->>'dictionary_form' ~ '^.+ \(.+\)$' then
            regexp_replace(c.fields->>'dictionary_form', '^(.+) \(.+\)$', '\1')
          else c.fields->>'dictionary_form'
        end as head_kanji,
        case
          when c.fields->>'dictionary_form' ~ '^.+ \(.+\)$' then
            regexp_replace(c.fields->>'dictionary_form', '^.+ \((.+)\)$', '\1')
          else c.fields->>'dictionary_form'
        end as head_reading
    ) parts
    cross join lateral pick_best_example(parts.head_kanji, parts.head_reading) pbe
   where c.fields->>'card_type' = 'verb_flashcard'
     and not (c.fields ? 'example')
     and pbe.jp_text is not null
)
update cards c
   set fields = c.fields || jsonb_build_object(
         'example',
         jsonb_build_object(
           'jp', m.jp_text,
           'en', m.en_text,
           'reading', m.reading,
           'source', m.source
         )
       )
  from matches m
 where c.id = m.id;

-- ── 3) Adjectives ────────────────────────────────────────────
with matches as (
  select c.id,
         pbe.jp_text,
         pbe.en_text,
         pbe.reading,
         pbe.source
    from cards c
    cross join lateral pick_best_example(
      c.fields->>'kanji',
      c.fields->>'hiragana'
    ) pbe
   where c.fields->>'card_type' = 'adjective_flashcard'
     and not (c.fields ? 'example')
     and pbe.jp_text is not null
)
update cards c
   set fields = c.fields || jsonb_build_object(
         'example',
         jsonb_build_object(
           'jp', m.jp_text,
           'en', m.en_text,
           'reading', m.reading,
           'source', m.source
         )
       )
  from matches m
 where c.id = m.id;

-- ── Coverage snapshot ────────────────────────────────────────
select fields->>'card_type' as card_type,
       count(*) filter (where fields ? 'example')  as with_example,
       count(*) filter (where not (fields ? 'example')) as without_example,
       count(*) as total
  from cards
 where fields->>'card_type' in (
   'noun_flashcard', 'verb_flashcard', 'adjective_flashcard'
 )
 group by fields->>'card_type'
 order by card_type;
