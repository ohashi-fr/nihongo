#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * scripts/generate_conjugation_seed.mjs
 *
 * Reads supabase/data/verbs_conjugation.json (array of
 * `{ card_type, group, kanji, reading, english, ending_note,
 *    short: {…7 forms}, long: {…7 forms} }`) and emits
 * supabase/seed_conjugation_flashcards.sql — an idempotent seed
 * that adds three new levels to the existing `conjugation` module
 * (Group I / II / III) and inserts the verb reference cards under
 * each. The existing conjugation drill levels stay untouched.
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

// Order + display names come straight from the spec.
const LEVELS = [
  { group: "I",   name: "Group I — Godan Verbs",     order: 100 },
  { group: "II",  name: "Group II — Ichidan Verbs",  order: 101 },
  { group: "III", name: "Group III — Irregular Verbs", order: 102 },
];

const MODULE_SLUG = "conjugation";

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

const buckets = new Map(LEVELS.map((l) => [l.group, []]));
for (const row of raw) {
  if (!buckets.has(row.group)) {
    console.error(`Unknown group '${row.group}' in row:`, row);
    process.exit(1);
  }
  buckets.get(row.group).push(row);
}
const totals = LEVELS.map((l) => ({ ...l, n: buckets.get(l.group).length }));
console.log(`Loaded ${raw.length} verbs across 3 groups:`);
for (const { group, name, n } of totals) {
  console.log(`  ${String(n).padStart(3)}  Group ${group}  — ${name}`);
}

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

function levelBlock({ group, name, order }, cards) {
  const rows = cards.map(jsonbLiteral).map((v) => `  (${v})`).join(",\n");
  return `
-- =========================================================
-- LEVEL ${order} — ${name} (${cards.length} verbs)
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

// --- Emit --------------------------------------------------------
const totalCards = totals.reduce((a, b) => a + b.n, 0);
const header = `-- =========================================================
-- Nihongo — Conjugation flashcard seed (generated)
-- Generated by scripts/generate_conjugation_seed.mjs — DO NOT EDIT.
-- Source: supabase/data/verbs_conjugation.json  (${raw.length} entries)
--
-- Adds three new levels to the existing "conjugation" module:
--   * Group I  — Godan Verbs
--   * Group II — Ichidan Verbs
--   * Group III — Irregular Verbs
-- Each card is a JSONB blob with card_type = 'verb_conjugation'
-- and nested \`short\` / \`long\` objects holding the 7 forms.
--
-- The existing conjugation drill levels (typing exercises) are
-- untouched — the "insert if level empty" guard would refuse to
-- add cards to a populated level anyway.
--
-- Idempotent — safe to re-run.
--   * Levels: insert only when a level with the same name is missing
--   * Cards:  insert only when the level currently holds zero cards
-- =========================================================
`;

const body = LEVELS.map((lv) => levelBlock(lv, buckets.get(lv.group))).join("\n");

const footer = `
-- =========================================================
-- Sanity check — should print 3 rows.
-- =========================================================
select lv.order_index, lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = '${MODULE_SLUG}'
  and lv.name in (${LEVELS.map((l) => `'${q(l.name)}'`).join(", ")})
group by lv.order_index, lv.name
order by lv.order_index;
`;

await writeFile(OUTPUT, header + "\n" + body + footer, "utf8");
console.log(`\nWrote ${OUTPUT}`);
console.log(`(${LEVELS.length} levels, ${totalCards} cards)`);
