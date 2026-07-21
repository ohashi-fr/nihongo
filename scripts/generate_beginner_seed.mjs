#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * scripts/generate_beginner_seed.mjs
 *
 * Reads supabase/data/beginner-lessons.json and generates
 * supabase/seed_beginner_lessons.sql — an idempotent seed that adds
 * one FLAT level "Beginner" to the "vocabulary" module and inserts
 * every card from the JSON with its correct card_type.
 *
 * Card types accepted:
 *   * noun_flashcard      { japanese, hiragana, english }
 *   * adverb_flashcard    { japanese, hiragana, english }  (new type)
 *   * verb_flashcard      { kanji, reading, group, short_form, long_form, translation_en }
 *   * adjective_flashcard { kanji?, hiragana, short_form, long_form, definition_en, opposite?, adjective_class }
 *
 * Verb `group` is normalised: "godan" → "I", "ichidan" → "II",
 * anything else → "III" (irregular). This keeps the shape
 * consistent with `seed_verbs.sql`.
 *
 * Verb payload is expanded to the existing verb_flashcard schema
 * (dictionary_form / masu_form / te_form / …). Beginner data only
 * gives us short_form + long_form, so the other forms are stored
 * as "—" — the existing UI already renders that as "missing".
 *
 * Fails LOUDLY on:
 *   * missing file
 *   * non-array root
 *   * unknown card_type
 *   * missing required field for a given card_type
 *
 * Usage:
 *   node scripts/generate_beginner_seed.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
// Ships from data/ alongside the other JSON seed sources
// (nouns_n5_complete.json, verbs_conjugation_full.json).
const INPUT = resolve(root, "data/beginner-lessons.json");
const OUTPUT = resolve(root, "supabase/seed_beginner_lessons.sql");

const MODULE_SLUG = "vocabulary";
const DEFAULT_LEVEL_NAME = "Beginner";
// Distinct order_index so it doesn't collide with existing seeded
// levels. 5 places it after Verbs / Adjectives; move it manually in
// the admin if you want it above the others.
const LEVEL_ORDER = 5;

// ── Load + validate top level ────────────────────────────────────
let doc;
try {
  doc = JSON.parse(await readFile(INPUT, "utf8"));
} catch (e) {
  if (e.code === "ENOENT") {
    console.error(`\n✗ Missing input: ${INPUT}`);
    console.error("  Drop your beginner-lessons.json in data/ then re-run.\n");
  } else {
    console.error(`\n✗ Could not parse ${INPUT}:`, e.message);
  }
  process.exit(1);
}

// The JSON root is an object `{ level, _notes, cards }` — extract the
// two things we care about (level metadata + the cards array) and
// fail loudly if either is missing.
if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
  console.error(`\n✗ Expected the JSON root of ${INPUT} to be an object with { level, cards }.`);
  process.exit(1);
}
const levelMeta = doc.level;
if (!levelMeta || typeof levelMeta !== "object") {
  console.error(`\n✗ Missing \`level\` object at the root of ${INPUT}.`);
  process.exit(1);
}
const LEVEL_NAME =
  typeof levelMeta.name === "string" && levelMeta.name.length > 0
    ? levelMeta.name
    : DEFAULT_LEVEL_NAME;
const LEVEL_SCRIPT =
  typeof levelMeta.script === "string" && levelMeta.script.length > 0
    ? levelMeta.script
    : "both";
const raw = doc.cards;
if (!Array.isArray(raw)) {
  console.error(`\n✗ Expected \`cards\` to be an array in ${INPUT}.`);
  process.exit(1);
}
if (raw.length === 0) {
  console.error(`\n✗ \`cards\` is empty in ${INPUT}.`);
  process.exit(1);
}

// ── Normalisers per card_type ────────────────────────────────────
const VERB_GROUP_MAP = { godan: "I", ichidan: "II", irregular: "III" };

function require_str(row, key, idx, type) {
  const v = row[key];
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(
      `Row ${idx} (${type}): required string field '${key}' is missing or empty. Row: ${JSON.stringify(row)}`
    );
  }
  return v;
}

function normaliseNounOrAdverb(row, idx, cardType) {
  return {
    card_type: cardType,
    japanese: typeof row.japanese === "string" ? row.japanese : "",
    hiragana: require_str(row, "hiragana", idx, cardType),
    english: require_str(row, "english", idx, cardType),
  };
}

function normaliseVerb(row, idx) {
  const kanji = typeof row.kanji === "string" ? row.kanji : "";
  const reading = require_str(row, "reading", idx, "verb_flashcard");
  const shortForm = require_str(row, "short_form", idx, "verb_flashcard");
  const longForm = require_str(row, "long_form", idx, "verb_flashcard");
  const groupRaw =
    typeof row.group === "string" ? row.group.toLowerCase() : "";
  const groupCode = VERB_GROUP_MAP[groupRaw] ?? "III";

  // dictionary_form matches the shape used by seed_verbs.sql:
  //   "kanji (reading)" when kanji ≠ reading, else just the plain form.
  const dictionaryForm =
    kanji && kanji !== reading ? `${kanji} (${reading})` : reading;

  return {
    card_type: "verb_flashcard",
    group: groupCode,
    dictionary_form: dictionaryForm,
    // Beginner data only exposes short + long. The other forms stay
    // as "—" so the existing UI renders "missing" the same way it
    // already does for seeded verbs that lack a potential form.
    te_form: "—",
    ta_form: "—",
    nai_form: "—",
    masu_form: longForm,
    potential_form: "—",
    translation_en: require_str(
      row,
      "translation_en",
      idx,
      "verb_flashcard"
    ),
  };
}

function normaliseAdjective(row, idx) {
  const kanji = typeof row.kanji === "string" ? row.kanji : "";
  const hiragana = require_str(row, "hiragana", idx, "adjective_flashcard");
  const shortForm = require_str(
    row,
    "short_form",
    idx,
    "adjective_flashcard"
  );
  const longForm = require_str(row, "long_form", idx, "adjective_flashcard");
  const definitionEn = require_str(
    row,
    "definition_en",
    idx,
    "adjective_flashcard"
  );
  const rawClass =
    typeof row.adjective_class === "string"
      ? row.adjective_class.toLowerCase()
      : "";
  if (rawClass !== "i" && rawClass !== "na") {
    throw new Error(
      `Row ${idx} (adjective): adjective_class must be "i" or "na", got ${JSON.stringify(row.adjective_class)}`
    );
  }
  return {
    card_type: "adjective_flashcard",
    kanji,
    hiragana,
    short_form: shortForm,
    long_form: longForm,
    definition_en: definitionEn,
    opposite: typeof row.opposite === "string" ? row.opposite : "",
    adjective_class: rawClass,
  };
}

// ── Normalise every row + tally by type ──────────────────────────
const counts = {};
const cards = raw.map((row, idx) => {
  const t = row.card_type;
  if (typeof t !== "string") {
    throw new Error(
      `Row ${idx}: card_type must be a string, got ${JSON.stringify(t)}`
    );
  }
  counts[t] = (counts[t] ?? 0) + 1;
  switch (t) {
    case "noun_flashcard":
    case "adverb_flashcard":
      return normaliseNounOrAdverb(row, idx, t);
    case "verb_flashcard":
      return normaliseVerb(row, idx);
    case "adjective_flashcard":
      return normaliseAdjective(row, idx);
    default:
      throw new Error(`Row ${idx}: unknown card_type "${t}".`);
  }
});

console.log(`Loaded ${cards.length} cards from ${INPUT}:`);
for (const [k, v] of Object.entries(counts).sort()) {
  console.log(`  ${String(v).padStart(4)}  ${k}`);
}

// ── SQL helpers ──────────────────────────────────────────────────
function sqlq(s) {
  return String(s).replace(/'/g, "''");
}
function jsonbLit(obj) {
  return `'${sqlq(JSON.stringify(obj))}'::jsonb`;
}

const rowsSql = cards.map(jsonbLit).map((v) => `  (${v})`).join(",\n");

const header = `-- =========================================================
-- Nihongo — Beginner lessons seed (generated)
-- Generated by scripts/generate_beginner_seed.mjs — DO NOT EDIT.
-- Source: data/beginner-lessons.json (${cards.length} cards)
--
-- Adds ONE flat level "${LEVEL_NAME}" to the "vocabulary" module
-- mixing all four card types from the JSON. No group_name —
-- same rank as Verbs / Adjectives.
--
-- Idempotent:
--   * Level insert guarded on (module_id, name).
--   * Card inserts only fire when the level currently holds zero
--     cards, so re-runs don't produce duplicates.
--
-- Types:
${Object.entries(counts)
  .sort()
  .map(([k, v]) => `--   ${String(v).padStart(4)}  ${k}`)
  .join("\n")}
-- =========================================================

with m as (select id from modules where slug = '${MODULE_SLUG}')
insert into module_levels (module_id, name, order_index, script)
select m.id, '${sqlq(LEVEL_NAME)}', ${LEVEL_ORDER}, '${sqlq(LEVEL_SCRIPT)}' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = '${sqlq(LEVEL_NAME)}'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = '${MODULE_SLUG}' and lv.name = '${sqlq(LEVEL_NAME)}'
),
do_seed as (
  select id from lv where not exists (select 1 from cards c where c.level_id = lv.id)
)
insert into cards (level_id, fields)
select ds.id, v.fields
from do_seed ds
cross join (values
${rowsSql}
) as v(fields);

-- Sanity check
select lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = '${MODULE_SLUG}' and lv.name = '${sqlq(LEVEL_NAME)}'
group by lv.name;
`;

await writeFile(OUTPUT, header, "utf8");
console.log(`\nWrote ${OUTPUT}`);
console.log(`(1 level, ${cards.length} cards)`);
