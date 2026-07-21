#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * ingest_tatoeba_examples.mjs
 * ---------------------------
 * Loads example sentences from Tatoeba into `dictionary_examples`.
 *
 * ATTRIBUTION (required — CC-BY 2.0 FR)
 * -------------------------------------
 * Sentence data comes from https://tatoeba.org — © Tatoeba
 * contributors, licensed under CC BY 2.0 FR
 * (https://creativecommons.org/licenses/by/2.0/fr/).
 * The app credits this everywhere sentences are shown.
 *
 * ---- Manual setup ----
 *
 * 1. Download three files from https://downloads.tatoeba.org and
 *    place them in `supabase/data/`:
 *
 *       supabase/data/sentences.csv     (all sentences, all languages — ~200MB)
 *       supabase/data/links.csv         (translation links between sentence ids)
 *       supabase/data/jpn_indices.csv   (Japanese word→sentence indices)
 *
 *    The exact URLs / archive layout change occasionally; look for
 *    "sentences.tar.bz2", "links.tar.bz2", "jpn_indices.tar.bz2"
 *    in the downloads section. Extract locally, then move/rename
 *    to the paths above.
 *
 *    ⚠️ Do NOT rename the .csv extension — Tatoeba uses TSV inside
 *    files ending in `.csv` for historical reasons. The parser
 *    below treats them as tab-separated.
 *
 * 2. Install kuromoji (used for per-sentence reading generation).
 *    From the project root:
 *
 *       npm install kuromoji
 *
 *    kuromoji ships a ~10MB Japanese dictionary — this only needs
 *    to happen once. If you don't install it, the script still
 *    runs but the `reading` and `furigana` columns stay NULL.
 *
 * 3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (same key you used
 *    for the JMdict import). It bypasses RLS so the ingestion can
 *    write to `dictionary_examples`.
 *
 * 4. Run:
 *
 *       node --env-file=.env.local scripts/ingest_tatoeba_examples.mjs
 *
 *    Dry-run mode is the default and prints stats + a sample of 5
 *    would-be inserts. Add `--commit` to actually write:
 *
 *       node --env-file=.env.local scripts/ingest_tatoeba_examples.mjs --commit
 *
 * Filters applied (per your spec):
 *   * Japanese sentences only (lang == 'jpn').
 *   * char_len ≤ 40 for N5-friendly length.
 *   * Only sentences with at least one English translation via links.csv.
 *   * Drops rows where kuromoji fails to tokenize (stays NULL if
 *     kuromoji isn't installed).
 *
 * Table wipe is opt-in via `--truncate` so re-runs by default are
 * additive; `--truncate` runs `truncate dictionary_examples` first
 * for a clean reload.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const DATA_DIR = path.resolve(root, "supabase/data");

const SENTENCES = path.join(DATA_DIR, "sentences.csv");
const LINKS = path.join(DATA_DIR, "links.csv");
const JPN_INDICES = path.join(DATA_DIR, "jpn_indices.csv");

const CHAR_LEN_MAX = 40;

const args = new Set(process.argv.slice(2));
const COMMIT = args.has("--commit");
const TRUNCATE = args.has("--truncate");

// ── Preflight ─────────────────────────────────────────────────────
function requireFile(p) {
  if (!fs.existsSync(p)) {
    console.error(`\n✗ Missing file: ${p}`);
    console.error(
      "  Download the Tatoeba archives from https://downloads.tatoeba.org"
    );
    console.error("  and place them in supabase/data/ (as .csv — TSV inside).");
    process.exit(1);
  }
}
requireFile(SENTENCES);
requireFile(LINKS);
requireFile(JPN_INDICES);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (COMMIT && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error(
    "\n✗ Missing env for --commit mode. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY (Supabase Project Settings → API).\n"
  );
  process.exit(1);
}

// ── Optional kuromoji setup ───────────────────────────────────────
// kuromoji is a big dependency, so we import it lazily. If it's not
// available, we still produce useful data (jp + en) with NULL reading
// and furigana. The UI's `<ExampleBlock>` degrades gracefully.
let tokenizer = null;
try {
  const kuromoji = await import("kuromoji");
  const kbuild = kuromoji.default ?? kuromoji;
  const dicPath = path.join(root, "node_modules/kuromoji/dict");
  if (!fs.existsSync(dicPath)) {
    console.warn(
      "⚠️  kuromoji installed but dict/ folder missing at " + dicPath
    );
    console.warn("    Reading and furigana columns will stay NULL.");
  } else {
    tokenizer = await new Promise((resolve, reject) => {
      kbuild.builder({ dicPath }).build((err, t) => {
        if (err) reject(err);
        else resolve(t);
      });
    });
    console.log("✓ kuromoji tokenizer ready.");
  }
} catch {
  console.warn(
    "⚠️  kuromoji not installed. Reading and furigana columns will stay NULL."
  );
  console.warn("    To enable: npm install kuromoji");
}

// ── Helpers ───────────────────────────────────────────────────────
const KATA_TO_HIRA = /[ァ-ヶ]/g;
function katakanaToHiragana(s) {
  return s.replace(KATA_TO_HIRA, (m) =>
    String.fromCharCode(m.charCodeAt(0) - 0x60)
  );
}

/**
 * Tokenize a sentence with kuromoji. Returns:
 *   { reading, furigana } — reading = full hiragana of the sentence,
 *                            furigana = [{surface, reading}, ...] per token.
 * If kuromoji is unavailable, returns { reading: null, furigana: null }.
 */
function tokenizeSentence(jp) {
  if (!tokenizer) return { reading: null, furigana: null };
  const tokens = tokenizer.tokenize(jp);
  const furigana = tokens.map((t) => ({
    surface: t.surface_form,
    reading: t.reading ? katakanaToHiragana(t.reading) : null,
  }));
  const reading = furigana
    .map((f) => f.reading ?? f.surface)
    .join("")
    // Clean punctuation that kuromoji leaves as `null`+surface.
    .replace(/\s+/g, "");
  return { reading, furigana };
}

// Pure kana check (hiragana + katakana + long mark ー).
const KANA_ONLY_RE =
  /^[぀-ゟ゠-ヿー]+$/u;
// Reading must be *entirely* kana — refuse digits, latin, kanji, refs, etc.
const CLEAN_READING_RE =
  /^[぀-ゟ゠-ヿー]+$/u;

/**
 * Parse a WWWJDIC jpn_indices token: `<headword>(<reading>){surface}[sense]~`
 * Returns { entryKanji, entryReading } — reading is always normalised to
 * hiragana. Returns null (→ token dropped) when:
 *   * the token has no reading in parens AND the headword contains kanji
 *     (without a reading we have no way to know how it's pronounced);
 *   * the reading contains anything non-kana (Tatoeba occasionally leaks
 *     cross-EDICT refs like `#1392580` into that slot).
 *
 * Also strips the leading `~` (WWWJDIC "unsure" marker) so the headword
 * isn't `~見る`.
 */
function parseIndexToken(tok) {
  // Drop leading `~` (unsure marker) — headword becomes the plain form.
  if (tok.startsWith("~")) tok = tok.slice(1);
  const m = tok.match(/^([^(\[\{]+)(?:\(([^)]+)\))?/u);
  if (!m) return null;
  const kanji = m[1];
  let reading = m[2];

  if (!reading) {
    // No reading provided. Only accept when the headword is pure kana —
    // then IT is the reading. Reject anything with kanji: without a
    // reading we produce a noise row that will never match a card.
    if (!KANA_ONLY_RE.test(kanji)) return null;
    reading = kanji;
  }

  // Normalise katakana → hiragana so downstream matches stay consistent.
  reading = reading.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );

  // Reading must be purely kana — reject # refs, digits, latin, etc.
  if (!CLEAN_READING_RE.test(reading)) return null;

  return { entryKanji: kanji, entryReading: reading };
}

// ── Pass 1: sentences.csv — capture jpn + eng only ────────────────
console.log("Reading sentences.csv…");
const jpnSentences = new Map(); // id → text
const engSentences = new Map(); // id → text
{
  const rl = readline.createInterface({
    input: fs.createReadStream(SENTENCES, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const id = parseInt(parts[0], 10);
    const lang = parts[1];
    const text = parts[2];
    if (!Number.isFinite(id) || !text) continue;
    if (lang === "jpn") jpnSentences.set(id, text);
    else if (lang === "eng") engSentences.set(id, text);
    if (lineCount % 500_000 === 0) {
      process.stdout.write(
        `  ${lineCount.toLocaleString()} lines · jpn=${jpnSentences.size.toLocaleString()} · eng=${engSentences.size.toLocaleString()}\r`
      );
    }
  }
}
console.log(
  `\n  loaded ${jpnSentences.size.toLocaleString()} jp / ${engSentences.size.toLocaleString()} en sentences`
);

// ── Pass 2: links.csv — jpn→eng translations ─────────────────────
console.log("Reading links.csv…");
const jpToEn = new Map(); // jpn_id → first eng_id (shortest wins later? for now, first match)
{
  const rl = readline.createInterface({
    input: fs.createReadStream(LINKS, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const parts = line.split("\t");
    if (parts.length < 2) continue;
    const src = parseInt(parts[0], 10);
    const tgt = parseInt(parts[1], 10);
    if (!Number.isFinite(src) || !Number.isFinite(tgt)) continue;
    if (jpnSentences.has(src) && engSentences.has(tgt)) {
      // Keep shortest English translation for each jpn id.
      const existing = jpToEn.get(src);
      const candidate = engSentences.get(tgt);
      if (!existing || candidate.length < engSentences.get(existing).length) {
        jpToEn.set(src, tgt);
      }
    }
    if (lineCount % 1_000_000 === 0) {
      process.stdout.write(
        `  ${lineCount.toLocaleString()} link lines · matched=${jpToEn.size.toLocaleString()}\r`
      );
    }
  }
}
console.log(
  `\n  ${jpToEn.size.toLocaleString()} jpn sentences have an eng translation`
);

// ── Pass 3: jpn_indices.csv — headword→sentence tuples ───────────
console.log("Reading jpn_indices.csv, filtering (char_len ≤ 40, has en)…");
const rows = []; // { entry_kanji, entry_reading, jp_text, en_text, jp_id }
{
  const rl = readline.createInterface({
    input: fs.createReadStream(JPN_INDICES, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let lineCount = 0;
  let charLenFiltered = 0;
  let noEngFiltered = 0;
  for await (const line of rl) {
    lineCount++;
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const jpId = parseInt(parts[0], 10);
    const indices = parts[2];
    if (!Number.isFinite(jpId)) continue;
    const jpText = jpnSentences.get(jpId);
    if (!jpText) continue;
    if (jpText.length > CHAR_LEN_MAX) {
      charLenFiltered++;
      continue;
    }
    const engId = jpToEn.get(jpId);
    if (!engId) {
      noEngFiltered++;
      continue;
    }
    const engText = engSentences.get(engId);

    // Every index token = one (kanji, reading) headword this sentence
    // illustrates. A sentence with N useful words yields N rows.
    for (const tok of indices.split(/\s+/)) {
      if (!tok) continue;
      // Skip tokens marked as "checked but unsure" (~ suffix).
      // Also skip surface-form-only tokens ({…}) with no headword.
      const parsed = parseIndexToken(tok);
      if (!parsed) continue;
      if (!parsed.entryKanji) continue;
      rows.push({
        entry_kanji: parsed.entryKanji,
        entry_reading: parsed.entryReading,
        jp_text: jpText,
        en_text: engText,
        char_len: jpText.length,
      });
    }
    if (lineCount % 20_000 === 0) {
      process.stdout.write(
        `  ${lineCount.toLocaleString()} index lines · rows=${rows.length.toLocaleString()}\r`
      );
    }
  }
  console.log(
    `\n  produced ${rows.length.toLocaleString()} rows` +
      ` (filtered: ${charLenFiltered.toLocaleString()} by length,` +
      ` ${noEngFiltered.toLocaleString()} without eng)`
  );
}

// ── Tokenize (adds reading + furigana per row) ───────────────────
if (tokenizer) {
  console.log("Tokenizing with kuromoji…");
  const seenJp = new Map(); // jp_text → { reading, furigana } to avoid re-tokenizing
  for (let i = 0; i < rows.length; i++) {
    const jp = rows[i].jp_text;
    let ann = seenJp.get(jp);
    if (!ann) {
      ann = tokenizeSentence(jp);
      seenJp.set(jp, ann);
    }
    rows[i].reading = ann.reading;
    rows[i].furigana = ann.furigana;
    if ((i + 1) % 10_000 === 0) {
      process.stdout.write(
        `  ${i + 1}/${rows.length} rows tokenized\r`
      );
    }
  }
  console.log(
    `\n  ${seenJp.size.toLocaleString()} unique sentences tokenized`
  );
} else {
  for (const r of rows) {
    r.reading = null;
    r.furigana = null;
  }
}

// ── Print stats + sample ──────────────────────────────────────────
const uniqEntries = new Set(
  rows.map((r) => `${r.entry_kanji}|${r.entry_reading}`)
).size;
console.log(`\n${"=".repeat(60)}`);
console.log(`Total rows to load : ${rows.length.toLocaleString()}`);
console.log(`Unique headwords   : ${uniqEntries.toLocaleString()}`);
console.log(
  `Length distribution: ${percentile(rows, 0.5)} (p50) / ${percentile(rows, 0.95)} (p95) chars`
);
console.log(`\nSample rows:`);
for (const r of pickSamples(rows, 5)) {
  console.log(
    `  ${r.entry_kanji}(${r.entry_reading})  →  ${r.jp_text}\n` +
      `                                          ${r.en_text}`
  );
}

if (!COMMIT) {
  console.log(
    `\nDry run. Re-run with --commit to load into Supabase.\n` +
      `(Add --truncate to wipe the table before loading.)`
  );
  process.exit(0);
}

// ── Commit — load into Supabase in batches ───────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (TRUNCATE) {
  console.log("Truncating dictionary_examples…");
  const { error } = await supabase
    .from("dictionary_examples")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("Truncate failed:", error);
    process.exit(1);
  }
}

const BATCH = 500;
let inserted = 0;
const t0 = Date.now();
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH).map((r) => ({
    entry_kanji: r.entry_kanji,
    entry_reading: r.entry_reading,
    jp_text: r.jp_text,
    en_text: r.en_text,
    reading: r.reading,
    furigana: r.furigana,
    char_len: r.char_len,
  }));
  const { error } = await supabase
    .from("dictionary_examples")
    .insert(chunk);
  if (error) {
    console.error(`\nInsert failed at batch ${i}:`, error);
    process.exit(1);
  }
  inserted += chunk.length;
  process.stdout.write(
    `  inserted ${inserted.toLocaleString().padStart(9)} / ${rows.length.toLocaleString()}\r`
  );
}
const elapsedS = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✓ Done in ${elapsedS}s. Inserted ${inserted.toLocaleString()} rows.`);

const { count } = await supabase
  .from("dictionary_examples")
  .select("*", { count: "exact", head: true });
console.log(`✓ Table now holds ${count?.toLocaleString?.() ?? count} rows.`);

// ── Helpers for sample + percentile ─────────────────────────────
function percentile(list, q) {
  if (list.length === 0) return 0;
  const sorted = list.map((r) => r.char_len).sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[idx];
}

function pickSamples(list, n) {
  if (list.length <= n) return list;
  const step = Math.floor(list.length / n);
  const out = [];
  for (let i = 0; i < n; i++) out.push(list[i * step]);
  return out;
}
