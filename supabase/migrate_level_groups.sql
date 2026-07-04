-- =========================================================
-- Nihongo — Level grouping (module → group → level → cards)
-- =========================================================
-- Adds a generic, optional `group_name` on module_levels so a
-- module can nest a batch of related levels under a single entry
-- in the level list. Rules the app follows:
--
--   * group_name IS NULL  → level renders flat as before
--   * group_name IS NOT NULL → level renders under a group entry,
--     which links to an intermediate /modules/<slug>/group/<name>
--     page listing every level sharing that group_name.
--
-- Nothing about this is noun-specific; it's a generic mechanism
-- other modules can use later.
--
-- Also performs a one-time data move:
-- the standalone "N5 Nouns" module is being folded into Vocabulary,
-- with its 12 category levels grouped as "Nouns". The empty
-- module row is then dropped from `modules` so it stops showing on
-- the home. Card ids stay the same, so favorites survive intact.
--
-- Idempotent — safe to re-run.
-- =========================================================

-- 1) The column itself.
alter table module_levels
  add column if not exists group_name text;

-- Optional (small speed-up) — narrow index for group lookups when
-- a module has a lot of grouped levels. Cheap to add, does no harm.
create index if not exists idx_module_levels_group_name
  on module_levels (module_id, group_name)
  where group_name is not null;

-- 2) Move the N5 noun levels into Vocabulary, tagged with the
--    group name "Nouns". `where module_id = …` scopes the update so
--    this is a no-op after it's run once (the levels no longer
--    live under n5-nouns).
update module_levels
   set module_id  = (select id from modules where slug = 'vocabulary'),
       group_name = 'Nouns'
 where module_id  = (select id from modules where slug = 'n5-nouns');

-- 3) The n5-nouns module row is now empty of levels. Drop it so it
--    disappears from the home page. Guarded so re-running the file
--    doesn't error after the row is gone.
delete from modules
 where slug = 'n5-nouns';

-- Sanity check — should list Vocabulary's levels: the pre-existing
-- ungrouped ones (Level 1 / renamed, Verbs, Adjectives) plus the
-- 12 noun levels now tagged group_name = 'Nouns'.
select lv.order_index,
       lv.name,
       coalesce(lv.group_name, '(flat)') as grp,
       count(c.id) as cards
  from module_levels lv
  join modules m on m.id = lv.module_id
  left join cards c on c.level_id = lv.id
 where m.slug = 'vocabulary'
 group by lv.order_index, lv.name, lv.group_name
 order by lv.order_index;
