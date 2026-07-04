-- =========================================================
-- Nihongo — Clean the "old - random words" vocab level
-- =========================================================
-- Removes the verbs and i-adjectives that were seeded when the
-- module was a mixed bag. Verbs now live in the dedicated Verb
-- levels; adjectives live in the Adjectives module. What we keep
-- here is the noun pool.
--
-- Kept as-is (uncertain — manual triage recommended):
--   * きれい — na-adjective, but often used noun-like in beginner
--     material. Flagged for you to decide manually.
--
-- Level matching: the seed originally names the row 'Level 1'.
-- You may have renamed it in the admin to 'old - random words'.
-- The CTE below matches either.
--
-- Idempotent — re-running is safe (deleting already-deleted rows
-- is a no-op).
-- =========================================================

with lv as (
  select lv.id
  from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'vocabulary'
    and lv.name in ('Level 1', 'old - random words')
)
delete from cards c
using lv
where c.level_id = lv.id
  and c.fields->>'japanese' in (
    -- i-adjectives ------------------------------------------
    'いい',        -- good
    'おおきい',    -- big
    'たかい',      -- expensive / tall
    'おいしい',    -- delicious
    'むずかしい',  -- difficult
    -- polite verbs (masu-form) ------------------------------
    'いきます',    -- to go
    'のみます'     -- to drink
  );

-- Verify what remains — should be 67 rows (66 nouns + きれい).
select c.fields->>'japanese' as japanese,
       c.fields->>'english' as english
from cards c
join module_levels lv on lv.id = c.level_id
join modules m on m.id = lv.module_id
where m.slug = 'vocabulary'
  and lv.name in ('Level 1', 'old - random words')
order by japanese;
