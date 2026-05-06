"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";

export type McqOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

// ─────────────────────────────────────────────────────────────────────
// Distractor selection
// ─────────────────────────────────────────────────────────────────────

function shuffleArr<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupeKey(s: string): string {
  return (s ?? "").trim().normalize("NFC").toLowerCase();
}

/**
 * Build the four MCQ options for a quiz card. Distractors are drawn
 * from `pool` cards sharing the same `fields.word_type` as the correct
 * answer (more pedagogically useful than random picks). If there are
 * fewer than 3 same-type candidates, falls back to all other cards in
 * the pool. Never returns the correct answer as a distractor and never
 * returns two options with the same `fields.japanese` value.
 *
 * The returned array is shuffled, with the correct answer placed at a
 * random position.
 */
export function buildMcqOptions(
  currentCard: Card,
  pool: Card[]
): McqOption[] {
  const cf = currentCard.fields as any;
  const correctJapanese: string = cf.japanese ?? "";
  const correctType = cf.word_type;

  // Step 1 — same word_type, excluding the current card.
  let candidates = pool.filter(
    (c) =>
      c.id !== currentCard.id &&
      (c.fields as any).word_type === correctType
  );

  // Step 2 — fallback when fewer than 3 same-type cards.
  if (candidates.length < 3) {
    candidates = pool.filter((c) => c.id !== currentCard.id);
  }

  // Step 3 — shuffle then dedupe by `japanese`. The correct answer is
  // pre-seeded into `seen` so it can't reappear as a distractor.
  const seen = new Set<string>([dedupeKey(correctJapanese)]);
  const distractors: Card[] = [];
  for (const c of shuffleArr(candidates)) {
    const jp = (c.fields as any).japanese ?? "";
    const key = dedupeKey(jp);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(c);
    if (distractors.length === 3) break;
  }

  const options: McqOption[] = [
    { id: currentCard.id, label: correctJapanese, isCorrect: true },
    ...distractors.map((d) => ({
      id: d.id,
      label: (d.fields as any).japanese ?? "",
      isCorrect: false,
    })),
  ];

  return shuffleArr(options);
}

type Props = {
  prompt: string;
  options: McqOption[];
  onAnswered: (wasCorrect: boolean) => void;
  onNext: () => void;
  // Render the prompt with the Japanese font when true (used for tasks
  // where the prompt itself is Japanese, like a kanji-to-reading drill).
  promptIsJapanese?: boolean;
  autoAdvanceMs?: number;
};

/**
 * Pure-presentation MCQ card. Caller supplies the prompt, the four
 * options (one correct, the rest distractors), and callbacks for the
 * lifecycle. The card handles its own pick state and feedback styling.
 */
export default function McqCard({
  prompt,
  options,
  onAnswered,
  onNext,
  promptIsJapanese = false,
  autoAdvanceMs = 1500,
}: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const wasCorrect =
    picked !== null &&
    options.find((o) => o.id === picked)?.isCorrect === true;

  function pick(opt: McqOption) {
    if (picked !== null) return;
    setPicked(opt.id);
    onAnswered(opt.isCorrect);
    if (opt.isCorrect) {
      window.setTimeout(onNext, autoAdvanceMs);
    }
    // Wrong: stay on the card so the user can see the right answer; they
    // advance manually with the Next button.
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div
          className={`text-3xl font-medium ${promptIsJapanese ? "jp" : ""}`}
        >
          {prompt}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => {
          let cls =
            "btn-outline justify-start text-left jp text-lg whitespace-normal";
          if (picked !== null) {
            if (opt.isCorrect) {
              cls =
                "btn justify-start text-left jp text-lg whitespace-normal border border-green-600 bg-green-50 text-green-800";
            } else if (opt.id === picked) {
              cls =
                "btn justify-start text-left jp text-lg whitespace-normal border border-accent bg-accent/5 text-accent";
            } else {
              cls =
                "btn-outline justify-start text-left jp text-lg whitespace-normal opacity-50";
            }
          }
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt)}
              disabled={picked !== null}
              className={cls}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {picked !== null && wasCorrect && (
        <div className="mt-4 text-center text-green-700">正解！ Correct.</div>
      )}

      {picked !== null && !wasCorrect && (
        <div className="mt-4 text-center">
          <button onClick={onNext} className="btn-primary">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
