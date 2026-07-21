import type { ExampleSentence } from "@/lib/exampleSentence";

/**
 * Renders an example sentence at the bottom of a flip card's back
 * face. Two-line layout: the Japanese sentence, then the English
 * translation muted below. If a full kana reading is available it
 * slots in between (small, grey).
 *
 * Returns `null` when there is no example — no placeholder, no
 * empty section, no visual seam. Callers can drop the component in
 * unconditionally.
 */

type Props = {
  example: ExampleSentence | null | undefined;
};

export default function ExampleBlock({ example }: Props) {
  if (!example || !example.jp) return null;
  return (
    <div className="mt-4 border-t border-border/60 pt-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
        Example
      </div>
      <div className="jp mt-1.5 text-sm leading-snug text-ink">
        {example.jp}
      </div>
      {example.reading && example.reading !== example.jp && (
        <div className="jp mt-0.5 text-[11px] leading-snug text-muted">
          {example.reading}
        </div>
      )}
      {example.en && (
        <div className="mt-1 text-xs italic leading-snug text-muted">
          {example.en}
        </div>
      )}
    </div>
  );
}
