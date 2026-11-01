-- =========================================================
-- Nihongo — drop dictionary_examples.furigana
-- =========================================================
-- The per-token furigana jsonb was ~78% of the measured column
-- payload (~620 B/row on ~600k rows) and is read nowhere in the
-- app: AddCardForm only keeps jp_text / en_text / reading / source
-- from pick_best_example(). The table is rebuildable with
-- scripts/ingest_tatoeba_examples.mjs.
--
-- Run the steps ONE AT A TIME in the Supabase SQL Editor.
-- DROP COLUMN is instant but frees no space; VACUUM FULL rewrites
-- the table (ACCESS EXCLUSIVE lock — "add a word" can't fetch an
-- example while it runs — and it needs free disk for the new copy).
-- VACUUM cannot run inside a transaction: run it as its own,
-- single statement.
-- =========================================================

-- 0) Before: sizes
select pg_size_pretty(pg_total_relation_size('public.dictionary_examples')) as total,
       pg_size_pretty(pg_relation_size('public.dictionary_examples'))       as heap,
       pg_size_pretty(pg_indexes_size('public.dictionary_examples'))        as indexes;

-- 1) Drop the column (idempotent)
alter table public.dictionary_examples drop column if exists furigana;

-- 2) Reclaim the space — run alone
-- vacuum full public.dictionary_examples;

-- 3) After: sizes (same query as step 0)
-- 4) Sanity: the RPC still returns the four fields the app uses
select jp_text, en_text, reading, source
from pick_best_example('の', 'の');
