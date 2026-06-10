-- =========================================================
-- Nihongo — add Kanji Exam level
-- Adds an is_exam flag to module_levels and creates the
-- "Kanji Exam" level under the kanji module. Idempotent.
-- =========================================================

-- 1) Flag column on levels
alter table module_levels
  add column if not exists is_exam boolean default false;

-- 2) Exam level on the kanji module
with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script, is_exam)
select m.id, 'Kanji Exam', 99, 'none', true from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Kanji Exam'
);

-- 3) Make sure any existing row called "Kanji Exam" is flagged.
update module_levels lv
set is_exam = true
from modules m
where lv.module_id = m.id
  and m.slug = 'kanji'
  and lv.name = 'Kanji Exam';

-- 4) Sanity check
select lv.order_index, lv.name, lv.is_exam, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'kanji'
group by lv.order_index, lv.name, lv.is_exam
order by lv.order_index;
