#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * scripts/generate_conjugation_seed.mjs
 *
 * Reads supabase/data/verbs_conjugation.json (array of
 * `{ card_type, group, kanji, reading, english, ending_note,
 *    short: {…7 forms}, long: {…7 forms} }`) and emits
 * supabase/seed_conjugation_flashcards.sql — an idempotent seed
 * that adds ONE new level to the existing `conjugation` module,
 * mixing all Group I / II / III verbs together. Group info stays
 * on each card (`fields.group`) and surfaces as the small pill on
 * the flashcard front, so the mix stays legible.
 *
 * The existing conjugation drill levels stay untouched.
 *
 * SQL shape follows the seed_counting / seed_nouns pattern:
 *   * Module: assumed to already exist (slug='conjugation'). We
 *     don't re-insert it.
 *   * Levels: `insert … where not exists` guard on (module_id, name).
 *   * Cards:  insert only when the level is currently empty.
 *
 * Card fields are emitted as raw JSONB literals (each card is a
 * single quoted string cast `::jsonb`) so the nested `short`/`long`
 * objects survive untouched.
 *
 * Usage:
 *   node scripts/generate_conjugation_seed.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const INPUT = resolve(root, "supabase/data/verbs_conjugation.json");
const OUTPUT = resolve(root, "supabase/seed_conjugation_flashcards.sql");

// Single mixed level. Group info stays on each card; the client
// prints "Group I / II / III" as a badge on the front. order_index
// is high so the level appears after the existing drill levels.
const LEVEL_NAME = "Verb Conjugation Reference";
const LEVEL_ORDER = 100;

const MODULE_SLUG = "conjugation";

// Historic names from an earlier attempt that used one level per
// group. The emitted SQL defensively deletes these so re-runs and
// migrations from that attempt end up clean.
const LEGACY_LEVEL_NAMES = [
  "Group I — Godan Verbs",
  "Group II — Ichidan Verbs",
  "Group III — Irregular Verbs",
];

// --- Load + validate ---------------------------------------------
const raw = JSON.parse(await readFile(INPUT, "utf8"));
if (!Array.isArray(raw)) {
  console.error("Expected an array in", INPUT);
  process.exit(1);
}

const requiredTop = [
  "card_type",
  "group",
  "kanji",
  "reading",
  "english",
  "ending_note",
  "short",
  "long",
];
const requiredForms = [
  "present_aff",
  "present_neg",
  "past_aff",
  "past_neg",
  "te",
  "tai",
  "potential",
];
for (const [i, row] of raw.entries()) {
  for (const k of requiredTop) {
    if (!(k in row)) {
      console.error(`Row ${i} missing '${k}':`, row);
      process.exit(1);
    }
  }
  if (row.card_type !== "verb_conjugation") {
    console.error(`Row ${i} has wrong card_type: ${row.card_type}`);
    process.exit(1);
  }
  for (const half of ["short", "long"]) {
    for (const f of requiredForms) {
      if (typeof row[half][f] !== "string") {
        console.error(`Row ${i}.${half}.${f} not a string:`, row);
        process.exit(1);
      }
    }
  }
}

// Report per-group counts for the log, then merge into a single
// pool that lands in one level (input order preserved so all Group I
// verbs come first, then II, then III — same file order).
const perGroup = new Map();
for (const row of raw) {
  perGroup.set(row.group, (perGroup.get(row.group) ?? 0) + 1);
}
console.log(`Loaded ${raw.length} verbs across ${perGroup.size} groups:`);
for (const [g, n] of perGroup) {
  console.log(`  Group ${g}: ${n}`);
}
const cards = raw.slice();

// --- SQL helpers -------------------------------------------------
/** Double any ' inside a value for safe SQL string embedding. */
function q(s) {
  return String(s).replace(/'/g, "''");
}

/**
 * Serialize a card row as a `'{"...":"..."}'::jsonb` literal.
 * We wrap the JSON text with `q()` so any lone apostrophe inside a
 * gloss ("okay, I'm ready") is safely escaped.
 */
function jsonbLiteral(obj) {
  const json = JSON.stringify(obj);
  return `'${q(json)}'::jsonb`;
}

function levelBlock(name, order, cards) {
  const rows = cards.map(jsonbLiteral).map((v) => `  (${v})`).join(",\n");
  return `
-- =========================================================
-- LEVEL ${order} — ${name} (${cards.length} verbs, all groups mixed)
-- =========================================================
with m as (select id from modules where slug = '${MODULE_SLUG}')
insert into module_levels (module_id, name, order_index, script)
select m.id, '${q(name)}', ${order}, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = '${q(name)}'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = '${MODULE_SLUG}' and lv.name = '${q(name)}'
),
do_seed as (
  select id from lv where not exists (select 1 from cards c where c.level_id = lv.id)
)
insert into cards (level_id, fields)
select ds.id, v.fields
from do_seed ds
cross join (values
${rows}
) as v(fields);
`.trimStart();
}

/**
 * SQL to defensively delete rows from the earlier 3-level attempt.
 * FK to cards is `on delete cascade`, so removing the levels also
 * drops the (probably zero) cards under them.
 */
function legacyCleanupBlock() {
  const list = LEGACY_LEVEL_NAMES.map((n) => `'${q(n)}'`).join(", ");
  return `
-- =========================================================
-- Defensive cleanup — an earlier version of this seed created
-- three separate levels (Group I / II / III). If any of those
-- rows still exist, drop them so we don't ship two flavours of
-- the same content. Safe no-op if they were never created.
-- =========================================================
delete from module_levels
 where module_id = (select id from modules where slug = '${MODULE_SLUG}')
   and name in (${list});
`.trimStart();
}

// --- Emit --------------------------------------------------------
const header = `-- =========================================================
-- Nihongo — Conjugation flashcard seed (generated)
-- Generated by scripts/generate_conjugation_seed.mjs — DO NOT EDIT.
-- Source: supabase/data/verbs_conjugation.json  (${raw.length} entries)
--
-- Adds ONE level to the existing "conjugation" module named
-- "${LEVEL_NAME}" that mixes all three verb groups (I / II / III).
-- Group info stays on each card (\`fields.group\`) and surfaces as
-- a small pill on the flashcard front.
--
-- The existing conjugation drill levels (typing exercises) are
-- untouched — the "insert if level empty" guard would refuse to
-- add cards to a populated level anyway.
--
-- Idempotent — safe to re-run.
--   * Legacy cleanup: drops the three per-group levels from an
--     earlier attempt (no-op if they never existed).
--   * Level: insert only when a level with the same name is missing.
--   * Cards: insert only when the level currently holds zero cards.
-- =========================================================
`;

const body = legacyCleanupBlock() + "\n" + levelBlock(LEVEL_NAME, LEVEL_ORDER, cards);

const footer = `
-- =========================================================
-- Sanity check — should print one row with ${cards.length} cards.
-- =========================================================
select lv.order_index, lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = '${MODULE_SLUG}'
  and lv.name = '${q(LEVEL_NAME)}'
group by lv.order_index, lv.name;
`;

await writeFile(OUTPUT, header + "\n" + body + footer, "utf8");
console.log(`\nWrote ${OUTPUT}`);
console.log(`(1 level, ${cards.length} cards)`);
