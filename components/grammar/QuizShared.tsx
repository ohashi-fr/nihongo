"use client";

import Link from "next/link";
import { getNotionBySlug } from "@/content/grammar/grammar-data";

/**
 * Small pieces shared between the two grammar quiz engines (MCQ
 * GrammarQuiz and fill-in-the-blank ExamQuiz): the pre-quiz pill
 * picker, the in-quiz progress header, the results summary/actions,
 * and the "Review this notion" link. Keeping these in one place is
 * what lets both quizzes look and feel like one product even though
 * their question UIs (buttons vs text inputs) are different.
 */

// ─── Review link ──────────────────────────────────────────────────────

/** Link to the matching reference notion, opened in a new tab so an
 * in-progress quiz round is never lost. Returns null if the slug
 * doesn't resolve to a lesson. */
export function ReviewNotionLink({ notionSlug }: { notionSlug: string }) {
  const notion = getNotionBySlug(notionSlug);
  if (!notion) return null;
  return (
    <Link
      href={`/grammar?n=${notion.number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-700"
    >
      Review this notion →
    </Link>
  );
}

// ─── Pre-quiz pill picker ───────────────────────────────────────────

export function Pill({
  label,
  selected,
  onClick,
  tone = "primary",
  jp = false,
  bold = false,
  disabled = false,
}: {
  label: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  tone?: "primary" | "accent";
  jp?: boolean;
  bold?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`${jp ? "jp " : ""}rounded-full px-3.5 py-1.5 text-sm ${
        bold ? "font-semibold" : "font-medium"
      } transition disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? tone === "accent"
            ? "bg-accent text-primary shadow-soft"
            : "bg-primary text-white shadow-soft"
          : tone === "accent"
            ? "bg-soft text-sumi hover:bg-accent-100"
            : "bg-soft text-sumi hover:bg-primary-50"
      }`}
    >
      {label}
    </button>
  );
}

// ─── In-quiz progress header ────────────────────────────────────────

export function QuizProgressHeader({
  label,
  progressPct,
  onExit,
}: {
  label: string;
  progressPct: number;
  onExit: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between text-sm text-muted">
        <span>{label}</span>
        <button
          onClick={onExit}
          className="text-sm font-medium text-muted transition hover:text-primary"
        >
          Exit quiz
        </button>
      </div>
      <div className="progress-track mb-6">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
    </>
  );
}

// ─── Results screen ─────────────────────────────────────────────────

export function ResultsSummary({
  correct,
  total,
  unitLabel = "correct",
}: {
  correct: number;
  total: number;
  unitLabel?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <>
      <div className="jp text-4xl">お疲れ様</div>
      <h2 className="mt-3 text-2xl font-bold text-ink">Round complete</h2>
      <p className="mt-2 text-muted">
        {correct} / {total} {unitLabel}
      </p>
      <div className="my-6 text-5xl font-bold text-primary">{pct}%</div>
    </>
  );
}

export function ResultsActions({
  onRetry,
  onChangeScope,
  onExit,
  changeScopeLabel = "Change focus",
  retryLabel = "Retry — new shuffled round",
}: {
  onRetry: () => void;
  onChangeScope: () => void;
  onExit: () => void;
  changeScopeLabel?: string;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onRetry}
        className="btn-accent w-full justify-center !rounded-2xl !py-3 sm:w-auto sm:px-10"
      >
        {retryLabel}
      </button>
      <div className="mt-1 flex items-center gap-4">
        <button
          onClick={onChangeScope}
          className="text-sm font-medium text-muted transition hover:text-primary"
        >
          {changeScopeLabel}
        </button>
        <button
          onClick={onExit}
          className="text-sm font-medium text-muted transition hover:text-primary"
        >
          Back to grammar
        </button>
      </div>
    </div>
  );
}

// ─── Continue button ────────────────────────────────────────────────

export function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-primary">
      Continue →
    </button>
  );
}
