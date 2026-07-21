#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * cleanup_examples_noise.mjs
 * -------------------------
 * Deletes rows from `dictionary_examples` where the `entry_reading`
 * contains kanji characters. These are the noise rows produced by
 * the first version of the ingestion parser (which used the kanji
 * headword itself as the reading when jpn_indices provided no
 * reading in parens). They can never match a card and just waste
 * disk space.
 *
 * Legit kana-only headwords (パン/パン etc.) are kept — their
 * `entry_reading` has no CJK characters.
 *
 * Pagination: keyset via `WHERE id > last_id ORDER BY id ASC` so
 * we never hit Supabase's statement timeout, even on 500k rows.
 * OFFSET pagination hurts badly past a few thousand rows because
 * PostgREST rescans the full prefix every time.
 *
 * Runs via SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node --env-file=.env.local scripts/cleanup_examples_noise.mjs
 *   node --env-file=.env.local scripts/cleanup_examples_noise.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "\n✗ Missing env. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY in .env.local.\n"
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// CJK Unified Ideographs — matches every common kanji.
const CJK_REGEX = /[一-鿿]/;

const PAGE = 2000; // small enough to stay under the timeout
let lastId = "00000000-0000-0000-0000-000000000000";
let scanned = 0;
let noiseTotal = 0;
let deletedTotal = 0;
const t0 = Date.now();

console.log(
  DRY_RUN
    ? "Dry run — scanning with keyset pagination, NO deletes will fire."
    : "Scanning + deleting with keyset pagination."
);

while (true) {
  // Keyset page — always uses the id b-tree index. Never slows down.
  const { data, error } = await supabase
    .from("dictionary_examples")
    .select("id, entry_reading")
    .gt("id", lastId)
    .order("id", { ascending: true })
    .limit(PAGE);

  if (error) {
    console.error("\nQuery failed:", error);
    process.exit(1);
  }
  if (!data || data.length === 0) break;

  const noiseIds = [];
  for (const row of data) {
    scanned++;
    if (row.entry_reading && CJK_REGEX.test(row.entry_reading)) {
      noiseIds.push(row.id);
    }
  }
  noiseTotal += noiseIds.length;

  if (!DRY_RUN && noiseIds.length > 0) {
    // Delete this page's noise. Keep the batch to ≤500 so the
    // `.in()` clause stays small.
    const CHUNK = 500;
    for (let i = 0; i < noiseIds.length; i += CHUNK) {
      const slice = noiseIds.slice(i, i + CHUNK);
      const { error: delErr } = await supabase
        .from("dictionary_examples")
        .delete()
        .in("id", slice);
      if (delErr) {
        console.warn(
          `\n  ⚠ delete chunk at ${i} in page failed: ${delErr.message}`
        );
        continue;
      }
      deletedTotal += slice.length;
    }
  }

  lastId = data[data.length - 1].id;
  process.stdout.write(
    `  scanned ${scanned.toLocaleString().padStart(8)}` +
      `  noise ${noiseTotal.toLocaleString().padStart(8)}` +
      (DRY_RUN
        ? ""
        : `  deleted ${deletedTotal.toLocaleString().padStart(8)}`) +
      "\r"
  );
}

const elapsedS = ((Date.now() - t0) / 1000).toFixed(1);
console.log("\n");
console.log(`Scanned ${scanned.toLocaleString()} rows in ${elapsedS}s.`);
console.log(`Noise rows identified: ${noiseTotal.toLocaleString()}.`);
if (!DRY_RUN) {
  console.log(`Rows deleted: ${deletedTotal.toLocaleString()}.`);
}

// Final row count for confirmation.
const { count } = await supabase
  .from("dictionary_examples")
  .select("*", { count: "exact", head: true });
console.log(
  `dictionary_examples now holds ${(count ?? 0).toLocaleString()} rows.`
);

if (!DRY_RUN) {
  console.log(
    "\nNext: re-run  node --env-file=.env.local scripts/backfill_examples.mjs" +
      "\n      to fill the last few cards that couldn't be updated earlier."
  );
} else {
  console.log("\nRe-run without --dry-run to actually purge.");
}
