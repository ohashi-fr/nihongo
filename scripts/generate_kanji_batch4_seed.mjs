#!/usr/bin/env node
// Reads supabase/data/kanji-236-293.json and writes
// supabase/seed_kanji_batch4.sql (6 levels, 58 kanji — workbook numbers
// 236–293). Mirrors seed_kanji_batch3.sql.
//
//   node scripts/generate_kanji_batch4_seed.mjs
//
// The workbook JSON has no per-kanji `meanings`, and gives kun'yomi
// without the dot notation the app uses (see supabase/fix_kunyomi.sql),
// so both are supplied below. The script aborts if a dotted reading
// doesn't match the JSON once the dot is removed.

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const INPUT = resolve(root, "supabase/data/kanji-236-293.json");
const OUTPUT = resolve(root, "supabase/seed_kanji_batch4.sql");

const FIRST_ORDER_INDEX = 18; // batch3 ends at 17; aggregates sit at 97/98.
const PREV_TOTAL = 140;

// number → meanings (authored here; not in the workbook JSON).
const MEANINGS = {
  236: ["to cut"], 237: ["ticket"], 238: ["to split", "to divide"],
  239: ["to carve", "moment"], 240: ["to burn", "to grill"],
  241: ["heat", "fever"], 242: ["point", "dot"],
  243: ["ice"], 244: ["sea", "ocean"], 245: ["to swim"], 246: ["to wash"],
  247: ["to bathe"], 248: ["to flow", "stream"], 249: ["hot water"],
  250: ["to extinguish", "to disappear"], 251: ["to cry"],
  252: ["to cure", "to govern"],
  253: ["effort", "to strive"], 254: ["to work for", "diligence"],
  255: ["to say (humble)", "to apply"], 256: ["man", "male"], 257: ["town"],
  258: ["to stay", "to stop"],
  259: ["new"], 260: ["place"], 261: ["iron", "railway"], 262: ["to record"],
  263: ["answer", "to answer"], 264: ["simple"],
  265: ["season", "joint", "section"], 266: ["to laugh", "to smile"],
  267: ["ordinal prefix"],
  268: ["heaven", "sky"], 269: ["origin", "former"], 270: ["husband", "man"],
  271: ["older brother"], 272: ["light", "to shine"], 273: ["to compare"],
  274: ["north"], 275: ["back (body)", "stature"], 276: ["body"],
  277: ["to serve", "work"], 278: ["to work"], 279: ["to use"],
  280: ["convenience", "mail"], 281: ["to resemble"], 282: ["to borrow"],
  283: ["healthy"], 284: ["low"],
  285: ["song", "to sing"], 286: ["desire", "to want"], 287: ["next", "order"],
  288: ["pain"], 289: ["tired"], 290: ["shop", "roof"],
  291: ["to be", "to reside"], 292: ["office", "bureau"],
  293: ["to reach", "to deliver"],
};

// number → kun'yomi in dictionary dot notation (reading.okurigana).
const KUN_DOT = {
  236: ["き.る"], 237: [], 238: ["わ.る", "わ.れる", "わり"], 239: ["きざ.む"],
  240: ["や.く", "や.ける"], 241: ["あつ.い"], 242: [],
  243: ["こおり", "ひ"], 244: ["うみ"], 245: ["およ.ぐ"], 246: ["あら.う"],
  247: ["あ.びる"], 248: ["なが.れる", "なが.す"], 249: ["ゆ"],
  250: ["き.える", "け.す"], 251: ["な.く"],
  252: ["なお.る", "なお.す", "おさ.める"],
  253: [], 254: ["つと.める"], 255: ["もう.す"], 256: ["おとこ"], 257: ["まち"],
  258: ["と.める", "と.まる"],
  259: ["あたら.しい", "あら.た"], 260: ["ところ"], 261: [], 262: [],
  263: ["こた.える"], 264: [], 265: ["ふし"], 266: ["わら.う", "え.む"],
  267: [],
  268: ["あま"], 269: ["もと"], 270: ["おっと"], 271: ["あに"],
  272: ["ひかり", "ひか.る"], 273: ["くら.べる"], 274: ["きた"], 275: ["せ"],
  276: ["からだ"], 277: ["つか.える"], 278: ["はたら.く"], 279: ["つか.う"],
  280: ["たよ.り"], 281: ["に.る"], 282: ["か.りる"], 283: ["すこ.やか"],
  284: ["ひく.い"],
  285: ["うた", "うた.う"], 286: ["ほ.しい"], 287: ["つぎ", "つ.ぐ"],
  288: ["いた.い"], 289: ["つか.れる"], 290: ["や"], 291: ["い.る"],
  292: [], 293: ["とど.く", "とど.け"],
};

const toHiragana = (s) =>
  s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

const sqlString = (s) => "'" + String(s).replace(/'/g, "''") + "'";

function cardJson(k) {
  const meanings = MEANINGS[k.number];
  const kun = KUN_DOT[k.number];
  if (!meanings) throw new Error(`No meanings for ${k.number} ${k.kanji}`);
  if (!kun) throw new Error(`No dotted kun for ${k.number} ${k.kanji}`);
  const plain = kun.map((r) => r.replace(".", ""));
  if (JSON.stringify(plain) !== JSON.stringify(k.kun)) {
    throw new Error(
      `kun mismatch for ${k.number} ${k.kanji}: ${JSON.stringify(plain)} vs ${JSON.stringify(k.kun)}`
    );
  }
  return JSON.stringify({
    kanji: k.kanji,
    meanings,
    kunyomi: kun,
    onyomi: k.on.map(toHiragana),
    card_type: "kanji_flashcard",
    // `red` only when true: absent = secondary word (same as existing cards).
    examples: k.words.map((w) => ({
      word: w.word,
      reading: w.reading,
      meaning: w.meaning,
      ...(w.red ? { red: true } : {}),
    })),
  });
}

const src = JSON.parse(await readFile(INPUT, "utf8"));
const levels = src.groups.map((g, i) => ({
  name: `${g.label} (${g.radical})`,
  order: FIRST_ORDER_INDEX + i,
  kanji: g.kanji,
}));
const total = levels.reduce((n, l) => n + l.kanji.length, 0);

let out = `-- =========================================================
-- Nihongo — Kanji module seed, batch 4
-- Adds ${levels.length} radical-grouped levels (${total} kanji, workbook numbers
-- 236–293) on top of seed_kanji_batch3.sql, bringing the module to
-- ${PREV_TOTAL + total} kanji total. GENERATED by scripts/generate_kanji_batch4_seed.mjs
-- from supabase/data/kanji-236-293.json — edit those, not this file.
--
-- Examples carry an optional "red": true flag = priority (tested)
-- vocabulary; absent = secondary word. Idempotent: each level is
-- created only if missing, its cards seeded only if it has none.
--
-- The aggregate levels (order_index 97 / 98) are virtual and pool
-- cards at request time, so these levels join them automatically:
-- 98 "All kanji - Review" takes every level; 97 "Review - Mid terms -
-- Beginner 1" takes every level with order_index >= 7 (these too).
-- =========================================================

with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, lv_name, lv_order, 'none' from m
cross join (values
${levels.map((l) => `  (${sqlString(l.name)}, ${l.order})`).join(",\n")}
) as v(lv_name, lv_order)
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = lv_name
);
`;

for (const l of levels) {
  out += `
-- ─── Level ${l.order} — ${l.name} (${l.kanji.length}) ${"─".repeat(8)}
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = ${sqlString(l.name)}
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
${l.kanji.map((k) => `  (${sqlString(cardJson(k))})`).join(",\n")}
) as v(fld);
`;
}

out += `
-- =========================================================
-- Module description bump (${PREV_TOTAL} → ${PREV_TOTAL + total} kanji)
-- =========================================================
update modules
set description = 'Learn the ${PREV_TOTAL + total} basic kanji — readings, meanings, and writing.'
where slug = 'kanji';

-- =========================================================
-- Sanity check
-- =========================================================
select lv.order_index, lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'kanji'
group by lv.order_index, lv.name
order by lv.order_index;
`;

await writeFile(OUTPUT, out, "utf8");
console.log(`Wrote ${OUTPUT}: ${levels.length} levels, ${total} kanji.`);
