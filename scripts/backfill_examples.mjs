#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * backfill_examples.mjs
 * ---------------------
 * Attaches example sentences from `dictionary_examples` to vocab
 * cards (noun / verb / adjective flashcards) and to custom cards.
 *
 * Runs entirely via `supabase-js` with the SERVICE_ROLE key. That
 * bypasses:
 *   * RLS (needed to reach every custom card across users)
 *   * The Studio SQL Editor's read-only mode (which is what
 *     forced us to use this script instead of the .sql files)
 *
 * Idempotent — skips cards that already have an example.
 *
 * ---- Manual setup ----
 *   node --env-file=.env.local scripts/backfill_examples.mjs
 *
 * Add `--dry-run` to see counts without writing.
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

/**
 * Ask Postgres for the best example given a (kanji, reading) pair.
 * Returns null when nothing matches or the RPC errors.
 */
async function pickBestExample(kanji, reading) {
  const { data, error } = await supabase.rpc("pick_best_example", {
    p_kanji: kanji,
    p_reading: reading,
  });
  if (error) {
    console.warn(
      `  ⚠ pick_best_example(${JSON.stringify(kanji)}, ${JSON.stringify(reading)}) failed:`,
      error.message
    );
    return null;
  }
  return data;
}

/**
 * Extract (kanji, reading) from a verb's `dictionary_form`, which
 * looks like `"歩く (あるく)"` or plain kana `"あるく"`.
 */
function splitVerbHead(dictionaryForm) {
  const m = dictionaryForm.match(/^(.+) \((.+)\)$/u);
  if (m) return { kanji: m[1], reading: m[2] };
  return { kanji: dictionaryForm, reading: dictionaryForm };
}

// ── Vocab cards (nouns / verbs / adjectives) ─────────────────────
async function backfillVocab() {
  console.log("\n── Vocab cards (noun / verb / adjective) ────────────");
  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, fields")
    .in("fields->>card_type", [
      "noun_flashcard",
      "verb_flashcard",
      "adjective_flashcard",
    ]);
  if (error) throw error;

  // Note: the `.in` filter above may not support jsonb selectors on
  // every PostgREST version. Filter defensively in JS too.
  const scoped = (cards ?? []).filter((c) =>
    ["noun_flashcard", "verb_flashcard", "adjective_flashcard"].includes(
      c.fields?.card_type
    )
  );
  const needing = scoped.filter((c) => !c.fields.example);
  console.log(
    `  ${scoped.length} vocab cards, ${needing.length} without example`
  );

  const byType = { noun: [], verb: [], adjective: [] };
  for (const c of needing) {
    if (c.fields.card_type === "noun_flashcard") byType.noun.push(c);
    else if (c.fields.card_type === "verb_flashcard") byType.verb.push(c);
    else if (c.fields.card_type === "adjective_flashcard")
      byType.adjective.push(c);
  }

  const stats = { noun: 0, verb: 0, adjective: 0 };
  const misses = { noun: 0, verb: 0, adjective: 0 };

  for (const [kind, list] of Object.entries(byType)) {
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const f = c.fields;

      let kanji, reading;
      if (kind === "noun") {
        kanji = f.japanese;
        reading = f.hiragana;
      } else if (kind === "verb") {
        const s = splitVerbHead(f.dictionary_form ?? "");
        kanji = s.kanji;
        reading = s.reading;
      } else {
        kanji = f.kanji;
        reading = f.hiragana;
      }

      const example = await pickBestExample(kanji, reading);
      if (!example) {
        misses[kind]++;
        continue;
      }

      if (!DRY_RUN) {
        const newFields = {
          ...f,
          example: {
            jp: example.jp_text,
            en: example.en_text,
            reading: example.reading,
            source: example.source,
          },
        };
        const { error: upErr } = await supabase
          .from("cards")
          .update({ fields: newFields })
          .eq("id", c.id);
        if (upErr) {
          console.warn(`  ⚠ update ${c.id} failed:`, upErr.message);
          continue;
        }
      }
      stats[kind]++;
      if ((i + 1) % 25 === 0) {
        process.stdout.write(
          `  ${kind}: ${stats[kind]} matched / ${i + 1} tried\r`
        );
      }
    }
    console.log(
      `  ${kind}: ${stats[kind]} matched, ${misses[kind]} not found (of ${list.length})`
    );
  }
}

// ── Custom cards ─────────────────────────────────────────────────
async function backfillCustom() {
  console.log("\n── Custom cards ─────────────────────────────────────");
  const { data: cards, error } = await supabase
    .from("custom_cards")
    .select("id, kanji, reading, example_jp");
  if (error) throw error;

  const needing = (cards ?? []).filter((c) => !c.example_jp);
  console.log(
    `  ${(cards ?? []).length} custom cards, ${needing.length} without example`
  );

  let matched = 0;
  let missed = 0;
  for (let i = 0; i < needing.length; i++) {
    const c = needing[i];
    const example = await pickBestExample(c.kanji, c.reading);
    if (!example) {
      missed++;
      continue;
    }
    if (!DRY_RUN) {
      const { error: upErr } = await supabase
        .from("custom_cards")
        .update({
          example_jp: example.jp_text,
          example_en: example.en_text,
          example_reading: example.reading,
          example_source: example.source,
        })
        .eq("id", c.id);
      if (upErr) {
        console.warn(`  ⚠ update ${c.id} failed:`, upErr.message);
        continue;
      }
    }
    matched++;
    if ((i + 1) % 25 === 0) {
      process.stdout.write(
        `  custom: ${matched} matched / ${i + 1} tried\r`
      );
    }
  }
  console.log(
    `  custom: ${matched} matched, ${missed} not found (of ${needing.length})`
  );
}

// ── Coverage snapshot at the end ─────────────────────────────────
async function report() {
  console.log("\n── Coverage snapshot ────────────────────────────────");
  const types = ["noun_flashcard", "verb_flashcard", "adjective_flashcard"];
  for (const t of types) {
    const { data: all } = await supabase
      .from("cards")
      .select("id, fields")
      .eq("fields->>card_type", t);
    const total = (all ?? []).length;
    const withEx = (all ?? []).filter((c) => c.fields?.example).length;
    const pct = total > 0 ? Math.round((withEx / total) * 1000) / 10 : 0;
    console.log(
      `  ${t.padEnd(20)}  ${withEx.toString().padStart(4)} / ${total
        .toString()
        .padStart(4)}  (${pct}%)`
    );
  }
  const { data: cc } = await supabase
    .from("custom_cards")
    .select("id, example_jp");
  const ccTotal = (cc ?? []).length;
  const ccWith = (cc ?? []).filter((c) => c.example_jp).length;
  const ccPct = ccTotal > 0 ? Math.round((ccWith / ccTotal) * 1000) / 10 : 0;
  console.log(
    `  ${"custom_cards".padEnd(20)}  ${ccWith.toString().padStart(4)} / ${ccTotal.toString().padStart(4)}  (${ccPct}%)`
  );
}

// ── Main ─────────────────────────────────────────────────────────
console.log(
  DRY_RUN ? "DRY RUN — no writes will be performed." : "Running backfill…"
);
await backfillVocab();
await backfillCustom();
await report();
console.log("\n✓ Done.");
