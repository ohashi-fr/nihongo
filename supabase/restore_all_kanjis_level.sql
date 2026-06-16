-- =========================================================
-- Restore: "All Kanjis - Mid Terms" aggregate level
-- =========================================================
-- This level is a *virtual* row in `module_levels` — it owns no
-- cards of its own. The `/modules/kanji/[levelId]` route detects
-- it by name and at request time pools every card from the regular
-- (non-exam, non-aggregate) kanji levels.
--
-- If the row goes missing (e.g. `seed_kanji.sql` was re-run without
-- also re-running `migrate_kanji_flashcards.sql`, or the row was
-- deleted manually), the level disappears from the kanji page
-- listing. This snippet recreates it.
--
-- Idempotent — safe to re-run.
-- =========================================================

with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'All Kanjis - Mid Terms', 98, 'none' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m)
    and lv.name = 'All Kanjis - Mid Terms'
);

-- Verify — you should see Numbers, Nature, …, Movement & Actions,
-- then "All Kanjis - Mid Terms" at order 98, then "Kanji Exam" at 99.
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
