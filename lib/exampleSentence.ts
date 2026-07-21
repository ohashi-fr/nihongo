/**
 * Shape of the example-sentence payload attached to vocab cards.
 *
 * Seeded vocab (noun/verb/adjective flashcards) keeps its example
 * inside `fields.example` as JSONB — same shape as below.
 *
 * Custom cards keep the same info in four flat columns for
 * cheaper SELECT / UPDATE:
 *   example_jp      → jp
 *   example_en      → en
 *   example_reading → reading
 *   example_source  → source
 *
 * All fields except `jp` and `source` are nullable; `<ExampleBlock>`
 * degrades gracefully.
 */
export type ExampleSentence = {
  /** Japanese sentence (surface form, mixed kanji + kana). */
  jp: string;
  /** English translation, if any. */
  en: string | null;
  /** Full hiragana reading of the sentence, if kuromoji gave one. */
  reading: string | null;
  /** Attribution string — always the Tatoeba credit. */
  source: string;
};

/**
 * Small helper used by the flashcard clients to normalise the two
 * storage shapes into a single `ExampleSentence | null`.
 */
export function parseExample(raw: unknown): ExampleSentence | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const jp = typeof r.jp === "string" ? r.jp : null;
  if (!jp) return null;
  return {
    jp,
    en: typeof r.en === "string" ? r.en : null,
    reading: typeof r.reading === "string" ? r.reading : null,
    source:
      typeof r.source === "string" ? r.source : "Tatoeba (CC-BY 2.0 FR)",
  };
}
