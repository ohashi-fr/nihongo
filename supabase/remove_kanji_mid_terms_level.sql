-- =========================================================
-- Nihongo — remove the obsolete "Review - Mid terms - Beginner 1"
-- deck (order_index 97). It was virtual (owned no cards), so only
-- the module_levels row goes; every kanji card stays in its own
-- lesson and in "All kanji - Review".
-- Idempotent: safe to re-run. Do NOT re-run migrate_kanji_review_levels.sql
-- afterwards — it would recreate this level.
-- =========================================================

delete from module_levels lv
using modules m
where lv.module_id = m.id
  and m.slug = 'kanji'
  and lv.name = 'Review - Mid terms - Beginner 1';

select lv.order_index, lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'kanji'
group by lv.order_index, lv.name
order by lv.order_index;
