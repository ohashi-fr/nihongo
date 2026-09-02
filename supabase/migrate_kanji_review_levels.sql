-- =========================================================
-- Nihongo — Kanji review levels restructure
-- 1) Rename the aggregate "All Kanjis - Mid Terms" to "All kanji - Review".
-- 2) Add a second aggregate level "Review - Mid terms - Beginner 1" that
--    pools every kanji from "Weather & Time" (order_index 7) onward —
--    i.e. everything added after the original 6 "Beginner" levels.
--    Sits just above "All kanji - Review" (order_index 97 vs 98).
-- 3) Drop the "Kanji Exam" level (and its session history via cascade).
-- Idempotent: safe to re-run.
-- =========================================================

-- 1) Rename
update module_levels lv
set name = 'All kanji - Review'
from modules m
where lv.module_id = m.id
  and m.slug = 'kanji'
  and lv.name = 'All Kanjis - Mid Terms';

-- 2) New aggregate level — "Review - Mid terms - Beginner 1"
--    Virtual, owns no cards of its own (like "All kanji - Review").
--    The app pools cards at request time from regular levels with
--    order_index >= 7.
with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Review - Mid terms - Beginner 1', 97, 'none' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m)
    and lv.name = 'Review - Mid terms - Beginner 1'
);

-- 3) Drop "Kanji Exam" (cascades to its `cards` and `sessions` rows)
delete from module_levels lv
using modules m
where lv.module_id = m.id
  and m.slug = 'kanji'
  and lv.name = 'Kanji Exam';

-- =========================================================
-- Sanity check
-- =========================================================
select lv.order_index, lv.name, lv.is_exam, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'kanji'
group by lv.order_index, lv.name, lv.is_exam
order by lv.order_index;
