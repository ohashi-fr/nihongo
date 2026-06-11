/**
 * Derive the all-hiragana form of a conjugated verb form given the
 * verb's dictionary form (which carries the kanji + reading).
 *
 *   deriveHiragana("開けます", "開ける (あける)")  // → "あけます"
 *   deriveHiragana("行きます", "行く (いく)")      // → "いきます"
 *   deriveHiragana("来ます",   "来る (くる)")      // → "きます"  (irregular)
 *   deriveHiragana("勉強します", "勉強する (べんきょうする)") // → "べんきょうします"
 *   deriveHiragana("あります", "ある")              // → "あります" (already kana)
 *   deriveHiragana("—",       "...")               // → "—"
 *
 * Algorithm
 *   1. If `form` is empty or "—", pass through.
 *   2. If `dictionaryForm` is in the irregular table for the form,
 *      return that mapping.
 *   3. Parse "<written> (<reading>)". No parens → form is already kana,
 *      return it unchanged.
 *   4. Let `suffix` = longest common suffix of `written` and `reading`
 *      (the okurigana). `kanjiPrefix` = written minus suffix.
 *      `hiraganaPrefix` = reading minus suffix.
 *   5. If `form` starts with `kanjiPrefix`, return
 *      `hiraganaPrefix + form.slice(kanjiPrefix.length)`. Otherwise
 *      return `form` unchanged.
 */

const IRREGULAR: Record<string, Record<string, string>> = {
  // 来る has three different kanji-readings (き / こ / きた) depending on
  // the form, so no single prefix swap can derive them — hardcode.
  "来る (くる)": {
    "来ます": "きます",
    "来て": "きて",
    "来た": "きた",
    "来ない": "こない",
    "来られます": "こられます",
  },
};

function parseDictionaryForm(
  dictionaryForm: string
): { written: string; reading: string } | null {
  const m = dictionaryForm.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!m) return null;
  return { written: m[1].trim(), reading: m[2].trim() };
}

function longestCommonSuffix(a: string, b: string): string {
  // Iterate by code point to avoid splitting surrogate pairs.
  const arrA = Array.from(a);
  const arrB = Array.from(b);
  let i = 0;
  while (
    i < arrA.length &&
    i < arrB.length &&
    arrA[arrA.length - 1 - i] === arrB[arrB.length - 1 - i]
  ) {
    i++;
  }
  return arrA.slice(arrA.length - i).join("");
}

export function deriveHiragana(form: string, dictionaryForm: string): string {
  if (!form || form === "—") return form;

  // Step 2 — irregular table
  const irr = IRREGULAR[dictionaryForm];
  if (irr && irr[form]) return irr[form];

  // Step 3 — parse
  const parsed = parseDictionaryForm(dictionaryForm);
  if (!parsed) return form;

  // Step 4 — derive prefixes
  const { written, reading } = parsed;
  const suffix = longestCommonSuffix(written, reading);

  const writtenArr = Array.from(written);
  const readingArr = Array.from(reading);
  const suffixArr = Array.from(suffix);

  const kanjiPrefix = writtenArr
    .slice(0, writtenArr.length - suffixArr.length)
    .join("");
  const hiraganaPrefix = readingArr
    .slice(0, readingArr.length - suffixArr.length)
    .join("");

  if (!kanjiPrefix) return form;

  // Step 5 — swap
  if (form.startsWith(kanjiPrefix)) {
    return hiraganaPrefix + form.slice(kanjiPrefix.length);
  }
  return form;
}
