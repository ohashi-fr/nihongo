"use client";

import Link from "next/link";
import { useState } from "react";

export type PreQuizMode = { value: string; label: string };

const DEFAULT_MODES: PreQuizMode[] = [
  { value: "normal", label: "Type the answer" },
  { value: "mcq", label: "Multiple choice" },
];

type Props = {
  slug: string;
  levelId: string;
  levelName: string;
  cardCount: number;
  // Optional. Defaults to Normal / MCQ for the vocabulary + translation
  // levels. Other modules (kanji, etc.) can pass their own modes.
  modes?: PreQuizMode[];
};

/**
 * Shown before the quiz starts. The user picks a mode; clicking Start
 * navigates to `/modules/{slug}/{levelId}?mode={value}`.
 */
export default function PreQuizScreen({
  slug,
  levelId,
  levelName,
  cardCount,
  modes = DEFAULT_MODES,
}: Props) {
  const [mode, setMode] = useState<string>(modes[0]?.value ?? "");

  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 shadow-card">
      <div className="text-center">
        <div className="jp text-4xl">準備</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          {levelName}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Choose mode
        </p>
        <div
          className={`grid gap-3 ${
            modes.length >= 4
              ? "grid-cols-2"
              : modes.length === 3
                ? "grid-cols-3"
                : modes.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-1"
          }`}
        >
          {modes.map((m) => (
            <ModeButton
              key={m.value}
              label={m.label}
              selected={mode === m.value}
              onClick={() => setMode(m.value)}
            />
          ))}
        </div>
      </div>

      <Link
        href={`/modules/${slug}/${levelId}?mode=${mode}`}
        className="btn-primary mt-6 w-full justify-center"
      >
        Start
      </Link>
    </div>
  );
}

function ModeButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-center rounded-lg border p-5 text-center transition ${
        selected
          ? "border-ink bg-ink text-paper shadow-card"
          : "border-border bg-white text-ink hover:bg-soft"
      }`}
    >
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
