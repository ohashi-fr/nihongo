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
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-card sm:p-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100">
          <span className="jp text-2xl text-accent-700">準備</span>
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">
          {levelName}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
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
        className="btn-accent mt-8 w-full justify-center !rounded-2xl !py-3 text-base"
      >
        Start →
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
      className={`flex items-center justify-center rounded-2xl border-2 p-5 text-center transition ${
        selected
          ? "border-primary bg-primary text-white shadow-card"
          : "border-transparent bg-soft text-primary hover:bg-primary-50"
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
