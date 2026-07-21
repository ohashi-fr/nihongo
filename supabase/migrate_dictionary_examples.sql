-- =========================================================
-- Nihongo — Example sentences (Tatoeba, CC-BY 2.0 FR)
-- =========================================================
-- Runtime-queryable index of example sentences pulled from
-- Tatoeba via `scripts/ingest_tatoeba_examples.mjs`. One row per
-- (headword, jp sentence) pair — a single sentence can appear
-- multiple times when it illustrates multiple headwords.
--
-- Read-only for anon + authenticated (like `dictionary_entries`).
-- Only the ingestion script (service-role key) writes to it.
--
-- Idempotent — safe to re-run.
-- =========================================================

create table if not exists dictionary_examples (
  id             uuid primary key default gen_random_uuid(),
  entry_kanji    text,
  entry_reading  text,
  jp_text        text not null,
  en_text        text,
  reading        text,                       -- full kana of the sentence, for the "kana line" fallback
  furigana       jsonb,                      -- per-token annotations [{surface, reading}], nullable
  char_len       int not null,               -- length of jp_text for shortest-first sort
  source         text not null default 'Tatoeba (CC-BY 2.0 FR)',
  created_at     timestamptz not null default now()
);

create index if not exists idx_dict_examples_entry
  on dictionary_examples (entry_kanji, entry_reading);

alter table dictionary_examples enable row level security;

drop policy if exists "public read examples" on dictionary_examples;
create policy "public read examples"
  on dictionary_examples for select
  to anon, authenticated
  using (true);

-- =========================================================
-- pick_best_example(kanji, reading)
-- =========================================================
-- Returns the shortest usable sentence for a given headword, or
-- NULL if nothing matches. Requires an English translation.
-- Order by char_len asc, id asc for determinism.
--
-- Marked STABLE (no writes, deterministic per snapshot). Callers
-- from RLS-protected client code invoke it as SECURITY INVOKER
-- so the public SELECT policy on dictionary_examples applies.
-- =========================================================
create or replace function pick_best_example(
  p_kanji text,
  p_reading text
)
returns dictionary_examples
language sql
stable
parallel safe
as $$
  select *
    from dictionary_examples
   where entry_kanji = p_kanji
     and entry_reading = p_reading
     and en_text is not null
     and en_text <> ''
   order by char_len asc, id asc
   limit 1;
$$;

grant execute on function pick_best_example(text, text)
  to anon, authenticated;
