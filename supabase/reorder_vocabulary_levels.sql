-- =========================================================
-- Nihongo — Vocabulary page reorder + rename (idempotent)
--
-- 1. Shifts every "Nouns"-grouped level's order_index by +1 (1..12
--    -> 2..13) so the group's numbered badge (min of its members)
--    reads "02", sitting right after Verbs ("01").
-- 2. Moves Adjectives to order_index 3 (was 2), so it reads "03".
-- 3. Renames "Beginner" to "Beginner 2 - L1 L2".
--
-- Safe to re-run: guarded by current known values, so a second run
-- is a no-op.
-- =========================================================

with v as (select id from modules where slug = 'vocabulary')
update module_levels
set order_index = order_index + 1
where module_id = (select id from v)
  and group_name = 'Nouns'
  and order_index between 1 and 12;

with v as (select id from modules where slug = 'vocabulary')
update module_levels
set order_index = 3
where module_id = (select id from v)
  and name = 'Adjectives'
  and group_name is null
  and order_index = 2;

with v as (select id from modules where slug = 'vocabulary')
update module_levels
set name = 'Beginner 2 - L1 L2'
where module_id = (select id from v)
  and name = 'Beginner';

-- Sanity check
select name, group_name, order_index
from module_levels
where module_id = (select id from modules where slug = 'vocabulary')
order by group_name is not null, order_index;
