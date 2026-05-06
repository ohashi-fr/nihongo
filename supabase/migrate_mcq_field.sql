-- =========================================================
-- Nihongo — add supports_mcq flag to module_levels
-- Idempotent: safe to re-run.
-- =========================================================

alter table module_levels
  add column if not exists supports_mcq boolean default false;

-- Enable MCQ for the verbs level (no-op if the level isn't in your DB)
update module_levels set supports_mcq = true
where name = 'Vocabulary - Verbs';

-- Sanity check
select id, name, order_index, supports_mcq
from module_levels
order by name;
