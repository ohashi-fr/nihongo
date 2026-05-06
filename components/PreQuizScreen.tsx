"use client";

import Link from "next/link";
import { useState } from "react";

type Mode = "normal" | "mcq";

type Props = {
  slug: string;
  levelId: string;
  levelName: string;
  cardCount: number;
};

/**
 * Shown before the quiz starts on levels where supports_mcq = true.
 * The user picks Normal vs MCQ; clicking Start navigates back to the
 * same quiz URL with the chosen mode in `?mode=`.
 */
export default function PreQuizScreen({
  slug,
  levelId,
  levelName,
  cardCount,
}: Props) {
  const [mode, setMode] = useState<Mode>("normal");

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
        <div className="grid grid-cols-2 gap-3">
          <ModeButton
            label="Type the answer"
            selected={mode === "normal"}
            onClick={() => setMode("normal")}
          />
          <ModeButton
            label="Multiple choice"
            selected={mode === "mcq"}
            onClick={() => setMode("mcq")}
          />
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
