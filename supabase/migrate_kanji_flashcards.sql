-- =========================================================
-- Nihongo — Kanji flashcard enrolment + aggregate level
-- =========================================================
-- 1) Stamp every kanji card with card_type = 'kanji_flashcard'
--    so the review system can route them through the kanji
--    flashcard UI (mirrors the verb_flashcard convention).
-- 2) Add a virtual aggregate level "All Kanjis - Mid Terms"
--    at order_index 98 (just above Kanji Exam at 99).
--
-- Idempotent — safe to re-run.
-- =========================================================

-- 1) card_type stamp
update cards
set fields = fields || '{"card_type": "kanji_flashcard"}'
where level_id in (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji'
);

-- 2) Virtual aggregate level — intentionally holds no cards.
--    The /modules/kanji/[levelId] route detects this level by name
--    and pulls the pool from every regular (non-exam, non-aggregate)
--    kanji level at request time. This keeps a single source of
--    truth for each kanji card — see the rationale block below.
with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'All Kanjis - Mid Terms', 98, 'none' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m)
    and lv.name = 'All Kanjis - Mid Terms'
);

-- Sanity check
select
  lv.order_index,
  lv.name,
  lv.is_exam,
  count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'kanji'
group by lv.order_index, lv.name, lv.is_exam
order by lv.order_index;

-- =========================================================
-- Why virtual (no card duplication)?
-- =========================================================
-- A duplicating approach would `insert into cards … select …` to
-- copy every regular-level card into the aggregate level. That
-- would give the aggregate "real" rows, but:
--   * Each kanji would have TWO card rows. The user would have to
--     rate 食 once in "Movement & Actions" AND once in
--     "All Kanjis - Mid Terms" before both review entries were
--     scheduled. Same content, twice the work.
--   * Edits via the admin (correcting a meaning, adding an
--     example) would have to be propagated to both rows.
--   * Newly-added kanji wouldn't appear in the aggregate until
--     someone re-ran the copy job.
--
-- A virtual level avoids all three by sharing card.id with the
-- source level, so card_reviews stays per-kanji and the aggregate
-- automatically picks up new content.
-- =========================================================
