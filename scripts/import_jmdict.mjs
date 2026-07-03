#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * import_jmdict.mjs
 * -----------------
 * Loads a JMdict subset (English-only, common words) into the
 * `dictionary_entries` Supabase table. Run this once after applying
 * `supabase/migrate_dictionary.sql`. Re-runs are safe — the script
 * wipes and re-imports.
 *
 * =========================================================
 * ATTRIBUTION (required — CC-BY-SA 4.0)
 * =========================================================
 * This script imports and this app uses the JMdict dictionary file.
 * These files are the property of the Electronic Dictionary Research
 * and Development Group (EDRDG), and are used in conformance with
 * the Group's licence.  https://www.edrdg.org/edrdg/licence.html
 *
 * The attribution string MUST be visible in the app UI wherever
 * dictionary data is exposed to users. See the summary at the bottom
 * of this file for the recommended placement.
 * =========================================================
 *
 * ---- Manual setup ----
 *
 * 1. Download the "English-only common words" subset from
 *    https://github.com/scriptin/jmdict-simplified/releases
 *
 *    Grab the file named like:
 *        jmdict-eng-common-3.5.0.json.tgz     (~5 MB)
 *
 *    The dataset is already filtered to `commonOnly: true`, which is
 *    the beginner-friendly subset — ~35 000 entries, keeps us well
 *    inside Supabase's free-tier storage.
 *
 * 2. Extract it. On macOS/Linux:
 *        tar -xzf jmdict-eng-common-3.5.0.json.tgz
 *    You should end up with `jmdict-eng-common-3.5.0.json` (~30 MB).
 *
 * 3. Make sure your local .env.local contains the service-role key
 *    (Project Settings → API in Supabase Studio). We need it because
 *    `dictionary_entries` has RLS enabled with no write policy — only
 *    the service role can insert:
 *
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI…
 *
 * 4. Run (Node 20+ can auto-load .env.local):
 *
 *        node --env-file=.env.local scripts/import_jmdict.mjs \
 *            path/to/jmdict-eng-common-3.5.0.json
 *
 *    On older Node, pass env vars inline:
 *
 *        NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *          node scripts/import_jmdict.mjs path/to/jmdict-eng-common-3.5.0.json
 *
 * Expected duration: ~15 s over a decent connection for ~35k rows.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { toRomaji } from "wanakana";

// ---- Env ----------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "\n✗ Missing env. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY (Project Settings → API in Supabase).\n"
  );
  process.exit(1);
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error(
    "\nUsage:\n" +
      "  node --env-file=.env.local scripts/import_jmdict.mjs " +
      "<path/to/jmdict-eng-common-*.json>\n"
  );
  process.exit(1);
}

// ---- Load JSON ----------------------------------------------------
console.log(`Reading ${path.basename(jsonPath)}…`);
const raw = await fs.readFile(jsonPath, "utf8");
const data = JSON.parse(raw);
console.log(
  `  JMdict version ${data.version ?? "?"} ` +
    `(${data.dictDate ?? "?"}), commonOnly=${data.commonOnly ?? "n/a"}, ` +
    `${data.words?.length ?? 0} raw entries`
);

// ---- Transform → rows --------------------------------------------
// Rules:
//   - Kana entry is mandatory (source of `reading`).
//   - Kanji entry is optional (many words are kana-only, e.g. これ).
//   - We prefer the first `common: true` head-form when present.
//   - Only English glosses are kept (defensive — the source file is
//     eng-only anyway).
//   - Romaji is derived from the reading via wanakana.toRomaji, so
//     both katakana (アニメ → anime) and hiragana (たべる → taberu)
//     work uniformly.
//
const rows = [];
let skippedNoKana = 0;
let skippedNoGloss = 0;

for (const w of data.words ?? []) {
  const kanjiEntry = w.kanji?.find((k) => k.common) ?? w.kanji?.[0] ?? null;
  const kanaEntry = w.kana?.find((k) => k.common) ?? w.kana?.[0] ?? null;

  if (!kanaEntry) {
    skippedNoKana++;
    continue;
  }

  const reading = kanaEntry.text;
  const romaji = toRomaji(reading);

  const meanings = [];
  for (const s of w.sense ?? []) {
    for (const g of s.gloss ?? []) {
      if (g.lang && g.lang !== "eng") continue;
      if (typeof g.text === "string" && g.text.length > 0) {
        meanings.push(g.text);
      }
    }
  }
  if (meanings.length === 0) {
    skippedNoGloss++;
    continue;
  }

  rows.push({
    kanji: kanjiEntry?.text ?? null,
    reading,
    romaji,
    meanings,
    is_common: true, // source file is already commonOnly
  });
}

console.log(
  `  Prepared ${rows.length} rows ` +
    `(skipped ${skippedNoKana} without kana, ${skippedNoGloss} without English gloss)`
);

// ---- Wipe + insert ------------------------------------------------
// Idempotent. If you're re-running against a huge table and this is
// slow, you can `truncate dictionary_entries;` from Supabase Studio
// first — PostgREST's DELETE is per-row.
//
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Wiping existing dictionary_entries…");
{
  const { error } = await supabase
    .from("dictionary_entries")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("Delete failed:", error);
    process.exit(1);
  }
}

const BATCH = 500;
let inserted = 0;
const t0 = Date.now();

for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const { error } = await supabase.from("dictionary_entries").insert(chunk);
  if (error) {
    console.error(`\nInsert failed at batch starting ${i}:`, error);
    process.exit(1);
  }
  inserted += chunk.length;
  process.stdout.write(
    `  inserted ${inserted.toString().padStart(6)} / ${rows.length}\r`
  );
}
const elapsedS = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nInsert completed in ${elapsedS}s. Verifying row count…`);

const { count, error: countErr } = await supabase
  .from("dictionary_entries")
  .select("*", { count: "exact", head: true });

if (countErr) {
  console.error("Count query failed:", countErr);
  process.exit(1);
}

console.log(`\n✓ dictionary_entries now contains ${count} rows.`);
console.log(
  "\nReminder: display the JMdict/EDRDG attribution wherever the\n" +
    "dictionary is surfaced in the UI — the app footer plus a small\n" +
    'note near any "search dictionary" input is the safest placement.\n' +
    "Suggested text:\n\n" +
    "  Dictionary data from JMdict, property of the Electronic\n" +
    "  Dictionary Research and Development Group, used under\n" +
    "  https://www.edrdg.org/edrdg/licence.html (CC-BY-SA 4.0).\n"
);
