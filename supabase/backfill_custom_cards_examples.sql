-- =========================================================
-- Nihongo — Backfill example_* columns on custom_cards
-- =========================================================
-- One-shot. Idempotent — skips cards that already carry a
-- non-null example_jp. RLS on custom_cards restricts this to
-- rows owned by the current user, so if you run this as an
-- admin (via SQL Editor logged in as your user), it applies to
-- your own custom cards. Service-role bypasses RLS and covers
-- everyone.
--
-- Prerequisites:
--   * migrate_custom_cards_examples.sql applied
--   * dictionary_examples populated
-- =========================================================

with matches as (
  select cc.id,
         pbe.jp_text,
         pbe.en_text,
         pbe.reading,
         pbe.source
    from custom_cards cc
    cross join lateral pick_best_example(cc.kanji, cc.reading) pbe
   where cc.example_jp is null
     and pbe.jp_text is not null
)
update custom_cards cc
   set example_jp      = m.jp_text,
       example_en      = m.en_text,
       example_reading = m.reading,
       example_source  = m.source
  from matches m
 where cc.id = m.id;

-- Coverage snapshot for the user running the update.
select count(*) filter (where example_jp is not null)  as with_example,
       count(*) filter (where example_jp is null)      as without_example,
       count(*) as total
  from custom_cards;
