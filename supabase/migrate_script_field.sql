-- =========================================================
-- Nihongo — backfill fields.script on existing cards
-- Idempotent: rows that already have fields.script are untouched.
-- Run once after deploying the script-filter feature.
-- =========================================================

-- Mark katakana cards
update cards set fields = fields || '{"script": "katakana"}'
where fields->>'japanese' ~ '[゠-ヿ]';

-- Mark remaining vocabulary-shaped cards as hiragana
update cards set fields = fields || '{"script": "hiragana"}'
where fields->'script' is null
  and fields->>'english' is not null
  and fields->>'japanese' is not null;

-- Sanity check
select coalesce(fields->>'script', '(unset)') as script, count(*) as cards
from cards
group by fields->>'script'
order by 1;
