-- =========================================================
-- Nihongo — migrate French names to English
-- Run this ONCE in the Supabase SQL Editor if you already seeded
-- the database with the previous French names. Idempotent: a
-- second run is a no-op because the LIKE/eq matches no rows.
-- =========================================================

-- Modules: rename + reslug
update modules
set name = 'Vocabulary',
    slug = 'vocabulary',
    description = 'Common Japanese words — beginner.'
where slug = 'vocabulaire';

update modules
set name = 'Conjugation',
    slug = 'conjugation'
where slug = 'conjugaison';

-- Levels under Vocabulary
update module_levels lv
set name = 'Level 1'
from modules m
where lv.module_id = m.id
  and m.slug = 'vocabulary'
  and lv.name = 'Niveau 1';

-- Levels under Conjugation
update module_levels lv
set name = 'Tense Test Level 1'
from modules m
where lv.module_id = m.id
  and m.slug = 'conjugation'
  and lv.name = 'Tense Test Niveau 1';

update module_levels lv
set name = 'Conjugation Level 1'
from modules m
where lv.module_id = m.id
  and m.slug = 'conjugation'
  and lv.name = 'Conjugaison Niveau 1';

-- Sanity check: how things look now.
select m.slug, m.name as module, lv.name as level, lv.order_index
from modules m
left join module_levels lv on lv.module_id = m.id
order by m.slug, lv.order_index;
