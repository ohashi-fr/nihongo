-- =========================================================
-- Nihongo — Self-hosted JMdict subset for the custom deck
-- =========================================================
-- Backs the "custom deck" word-lookup UI. Populated once by
-- `scripts/import_jmdict.mjs` from the jmdict-simplified JSON
-- release (English-only common words). No runtime external API.
--
-- Attribution (required by the JMdict licence, CC-BY-SA 4.0):
--   This app uses the JMdict dictionary file. These files are
--   the property of the Electronic Dictionary Research and
--   Development Group (EDRDG), and are used in conformance with
--   the Group's licence. https://www.edrdg.org/edrdg/licence.html
--
-- Idempotent — safe to re-run.
-- =========================================================

create table if not exists dictionary_entries (
  id uuid primary key default gen_random_uuid(),
  kanji text,               -- e.g. 食べる (may be null for kana-only words)
  reading text not null,    -- hiragana/katakana reading, e.g. たべる
  romaji text,              -- romaji of the reading, for romaji search
  meanings text[] not null, -- English glosses
  is_common boolean default false,
  created_at timestamptz default now()
);

-- Straight column indexes for equality / prefix lookups.
create index if not exists idx_dict_kanji   on dictionary_entries (kanji);
create index if not exists idx_dict_reading on dictionary_entries (reading);
create index if not exists idx_dict_romaji  on dictionary_entries (romaji);

-- Array-containment GIN — powers `meanings @> array['eat']`.
create index if not exists idx_dict_meanings
  on dictionary_entries using gin (meanings);

-- (Full-text index intentionally omitted.)
--
-- We considered a `gin(to_tsvector('english', array_to_string(meanings, ' ')))`
-- index for partial-word / stemmed search, but Postgres refuses it:
-- `array_to_string(anyarray, text)` is polymorphic and marked STABLE,
-- and index expressions must be IMMUTABLE.
--
-- If you later want stemmed English search, add an IMMUTABLE SQL
-- wrapper and index over that:
--
--   create or replace function immutable_array_to_string(a text[], s text)
--     returns text language sql immutable parallel safe
--     as $$ select array_to_string(a, s) $$;
--   create index idx_dict_meanings_fts on dictionary_entries
--     using gin (to_tsvector(
--       'english'::regconfig,
--       immutable_array_to_string(meanings, ' ')
--     ));
--
-- For now, exact-word containment (via the GIN above) plus ILIKE
-- scans on 35k rows perform fine.

-- Public read-only. RLS is enabled; there is deliberately no
-- INSERT/UPDATE/DELETE policy so writes require the service-role
-- key (which is exactly what the import script uses).
alter table dictionary_entries enable row level security;

drop policy if exists "public read dictionary" on dictionary_entries;
create policy "public read dictionary"
  on dictionary_entries
  for select
  to anon, authenticated
  using (true);

-- =========================================================
-- Ranked search RPC — powers /api/dict/search
-- =========================================================
-- One round-trip search returning tier-ranked results:
--   tier 0 = exact match
--   tier 1 = prefix match
--   tier 2 = substring match
-- Within a tier, `is_common = true` sorts first.
--
-- `jp = true`  → search kanji/reading
-- `jp = false` → search romaji (case-insensitive) + English meanings
--
-- Runs as a sequential scan (no pattern-ops indexes needed) —
-- 22k rows resolve in ~50-150 ms which is fine for autocomplete.
-- If we ever need it faster, add:
--     create index idx_dict_kanji_pat   on dictionary_entries (kanji   text_pattern_ops);
--     create index idx_dict_reading_pat on dictionary_entries (reading text_pattern_ops);
--     create index idx_dict_romaji_pat  on dictionary_entries (romaji  text_pattern_ops);
--
-- STABLE + SECURITY INVOKER — inherits the caller's row-level
-- security context. The public SELECT policy covers both anon
-- and authenticated calls, so no security definer trickery.
-- =========================================================
create or replace function search_dictionary(
  q text,
  jp boolean,
  max_rows int default 15
)
returns table (
  id uuid,
  kanji text,
  reading text,
  romaji text,
  meanings text[],
  is_common boolean,
  tier smallint
)
language sql
stable
parallel safe
as $$
  with candidates as (
    -- Tier 0 — exact match
    select d.id, d.kanji, d.reading, d.romaji, d.meanings, d.is_common,
           0::smallint as tier
    from dictionary_entries d
    where
      (jp and (d.kanji = q or d.reading = q))
      or
      (not jp and (
        d.romaji = lower(q)
        or exists (
          select 1 from unnest(d.meanings) m
          where lower(m) = lower(q)
        )
      ))

    union all

    -- Tier 1 — prefix match
    select d.id, d.kanji, d.reading, d.romaji, d.meanings, d.is_common,
           1::smallint as tier
    from dictionary_entries d
    where
      (jp and (d.kanji like q || '%' or d.reading like q || '%'))
      or
      (not jp and (
        d.romaji like lower(q) || '%'
        or exists (
          select 1 from unnest(d.meanings) m
          where lower(m) like lower(q) || '%'
        )
      ))

    union all

    -- Tier 2 — substring match
    select d.id, d.kanji, d.reading, d.romaji, d.meanings, d.is_common,
           2::smallint as tier
    from dictionary_entries d
    where
      (jp and (d.kanji like '%' || q || '%' or d.reading like '%' || q || '%'))
      or
      (not jp and (
        d.romaji like '%' || lower(q) || '%'
        or exists (
          select 1 from unnest(d.meanings) m
          where lower(m) like '%' || lower(q) || '%'
        )
      ))
  ),
  best_tier as (
    -- Each entry keeps only its best (lowest) tier
    select distinct on (id)
      id, kanji, reading, romaji, meanings, is_common, tier
    from candidates
    order by id, tier asc
  )
  select id, kanji, reading, romaji, meanings, is_common, tier
  from best_tier
  order by
    tier asc,
    is_common desc,
    coalesce(kanji, reading) asc
  limit max_rows;
$$;

-- Make sure anon + authenticated can call the function (SELECT
-- privileges are separate from RLS).
grant execute on function search_dictionary(text, boolean, int)
  to anon, authenticated;
