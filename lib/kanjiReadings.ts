/**
 * Helpers for kanji readings stored in dictionary notation where a dot
 * separates the kanji part from the okurigana — e.g. "なが.い" means the
 * kanji 長 carries the reading なが and the trailing い is okurigana.
 *
 * Two helpers, used everywhere kun'yomi is touched:
 *   - getKunyomiAnswer(stored) → the canonical answer (kanji-only part)
 *   - formatKunyomi(stored)    → display string "なが(い)" with okurigana
 *                                in parentheses
 *
 * Behaviour for readings WITHOUT a dot (like "やま" or "うえ") is a
 * pass-through in both helpers.
 */

/**
 * The accepted answer for a stored reading. Drops any okurigana part.
 *
 *   "なが.い" → "なが"
 *   "やま"    → "やま"
 */
export function getKunyomiAnswer(reading: string): string {
  const dot = reading.indexOf(".");
  return dot === -1 ? reading : reading.slice(0, dot);
}

/**
 * Display form: kanji-reading immediately followed by okurigana wrapped
 * in parentheses.
 *
 *   "なが.い" → "なが(い)"
 *   "やま"    → "やま"
 */
export function formatKunyomi(reading: string): string {
  const dot = reading.indexOf(".");
  if (dot === -1) return reading;
  return reading.slice(0, dot) + "(" + reading.slice(dot + 1) + ")";
}
