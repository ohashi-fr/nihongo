"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getNotionBySlug } from "@/content/grammar/grammar-data";
import type { GrammarQuizQuestion } from "@/content/grammar/grammar-quiz";

type Phase = "setup" | "playing" | "results";

type RoundQuestion = GrammarQuizQuestion & { shuffledChoices: string[] };

type NotionStat = {
  slug: string;
  label: string;
  correct: number;
  total: number;
};

const COUNT_CHOICES = [10, 15, 20] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// notion_label looks like "もう / まだ (already / not yet)" — the pill
// picker just wants the short lead-in, not the parenthetical gloss.
function shortLabel(label: string): string {
  const idx = label.indexOf(" (");
  return idx === -1 ? label : label.slice(0, idx);
}

// Some questions end with an English hint in parentheses, e.g.
// "でんしゃは バス ____ はやいです。(faster than the bus)". That's as much
// of a giveaway as sentence_gloss, so it's stripped for display while
// answering — the underlying data is untouched (still used verbatim in
// the explanation/correction afterward).
function stripEnglishHint(question: string): string {
  return question.replace(/\s*\([^)]*\)\s*$/, "");
}

/** Link to the matching reference notion, opened in a new tab so an
 * in-progress quiz round is never lost. Returns null if the question's
 * notion doesn't resolve to a lesson (shouldn't happen with valid data). */
function ReviewNotionLink({ notionSlug }: { notionSlug: string }) {
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

type Props = {
  questions: GrammarQuizQuestion[];
  /** Leave the quiz and return to the grammar reference. */
  onExit: () => void;
  /** Reset the detail pane's scroll position (desktop) / window scroll
   * (mobile) — called on phase transitions so a new screen starts at
   * the top. */
  scrollToTop: () => void;
};

export default function GrammarQuiz({ questions, onExit, scrollToTop }: Props) {
  const scopeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const q of questions) {
      if (!seen.has(q.notion)) seen.set(q.notion, q.notion_label);
    }
    return Array.from(seen, ([slug, label]) => ({ slug, label }));
  }, [questions]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [scope, setScope] = useState<string>("all");
  const [count, setCount] = useState<number | "all">("all");
  // The full notion list is collapsed by default (too cluttered to show
  // upfront) — revealed on demand via a "Select a specific notion" toggle.
  const [showScopePicker, setShowScopePicker] = useState(false);

  const [order, setOrder] = useState<RoundQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showGloss, setShowGloss] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [notionStats, setNotionStats] = useState<Record<string, NotionStat>>({});
  const [savedSession, setSavedSession] = useState(false);

  const pool = useMemo(
    () => (scope === "all" ? questions : questions.filter((q) => q.notion === scope)),
    [questions, scope]
  );
  const effectiveCount = count === "all" ? pool.length : Math.min(count, pool.length);
  const visibleCountChoices = COUNT_CHOICES.filter((c) => c < pool.length);

  const total = order.length;
  const current = order[index];

  function selectScope(slug: string) {
    setScope(slug);
    const newPool = slug === "all" ? questions : questions.filter((q) => q.notion === slug);
    setCount(slug === "all" || newPool.length <= 10 ? "all" : 10);
  }

  function startQuiz() {
    const selected = shuffle(pool).slice(0, effectiveCount);
    const round: RoundQuestion[] = selected.map((q) => ({
      ...q,
      shuffledChoices: shuffle(q.choices),
    }));
    setOrder(round);
    setIndex(0);
    setPicked(null);
    setShowGloss(false);
    setCorrectCount(0);
    setNotionStats({});
    setSavedSession(false);
    setPhase("playing");
    scrollToTop();
  }

  function pick(choice: string) {
    if (picked !== null || !current) return;
    setPicked(choice);
    const wasCorrect = choice === current.answer;
    if (wasCorrect) setCorrectCount((n) => n + 1);
    setNotionStats((prev) => {
      const key = current.notion;
      const existing = prev[key] ?? {
        slug: current.notion,
        label: current.notion_label,
        correct: 0,
        total: 0,
      };
      return {
        ...prev,
        [key]: {
          ...existing,
          total: existing.total + 1,
          correct: existing.correct + (wasCorrect ? 1 : 0),
        },
      };
    });
    // No auto-advance, even on a correct answer — the user always
    // reviews the explanation and clicks Continue themselves.
  }

  function advance() {
    setPicked(null);
    setShowGloss(false);
    if (index + 1 >= total) {
      setPhase("results");
      scrollToTop();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function retry() {
    startQuiz();
  }

  function backToSetup() {
    setPhase("setup");
    scrollToTop();
  }

  // Save the round once we hit results. `sessions.level_id` is nullable
  // in the schema (it's a plain FK, not NOT NULL) — the grammar quiz
  // isn't a DB module, so we log the score with no level attached.
  useEffect(() => {
    if (phase !== "results" || savedSession || total === 0) return;
    (async () => {
      try {
        const supabase = createClient();
        await supabase.from("sessions").insert({
          level_id: null,
          total_cards: total,
          correct_first_try: correctCount,
        });
        setSavedSession(true);
      } catch {
        // Don't block the UI on a failed save.
      }
    })();
  }, [phase, savedSession, total, correctCount]);

  // ─── SETUP ──────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-accent-700"
              aria-hidden
            >
              <path
                d="M9 12.5l2 2 4-4.5M12 3a9 9 0 100 18 9 9 0 000-18z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">
            Grammar quiz
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Multiple-choice questions across all grammar notions. Pick a
            focus and a round size, then start.
          </p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Focus
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ScopePill
              label="All notions"
              selected={scope === "all"}
              onClick={() => {
                selectScope("all");
                setShowScopePicker(false);
              }}
            />
            <button
              type="button"
              onClick={() => setShowScopePicker((v) => !v)}
              className="text-sm font-medium text-primary transition hover:text-primary-700"
            >
              {showScopePicker ? "Hide notion list" : "Select a specific notion →"}
            </button>
          </div>

          {showScopePicker && (
            <div className="mt-3 flex flex-wrap gap-2">
              {scopeOptions.map((opt) => (
                <ScopePill
                  key={opt.slug}
                  label={shortLabel(opt.label)}
                  selected={scope === opt.slug}
                  onClick={() => selectScope(opt.slug)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Number of questions
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleCountChoices.map((c) => (
              <CountPill
                key={c}
                label={String(c)}
                selected={count === c}
                onClick={() => setCount(c)}
              />
            ))}
            <CountPill
              label={`All (${pool.length})`}
              selected={count === "all"}
              onClick={() => setCount("all")}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={startQuiz}
          disabled={pool.length === 0}
          className="btn-accent mt-8 w-full justify-center !rounded-2xl !py-3 text-base disabled:opacity-40"
        >
          Start → ({effectiveCount} {effectiveCount === 1 ? "question" : "questions"})
        </button>
      </div>
    );
  }

  // ─── RESULTS ────────────────────────────────────────────────────────
  if (phase === "results") {
    const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const missed = Object.values(notionStats)
      .filter((s) => s.correct < s.total)
      .sort((a, b) => a.correct / a.total - b.correct / b.total);

    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="jp text-4xl">お疲れ様</div>
        <h2 className="mt-3 text-2xl font-bold text-ink">Round complete</h2>
        <p className="mt-2 text-muted">
          {correctCount} / {total} correct
        </p>
        <div className="my-6 text-5xl font-bold text-primary">{pct}%</div>

        {missed.length > 0 && (
          <div className="mb-8 text-left">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Notions to review
            </p>
            <ul className="space-y-2">
              {missed.map((s) => (
                <li
                  key={s.slug}
                  className="flex items-center justify-between gap-3 rounded-xl bg-soft px-4 py-3"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-ink">
                    {shortLabel(s.label)}
                    <span className="ml-2 text-xs font-normal text-muted">
                      {s.correct}/{s.total} correct
                    </span>
                  </span>
                  <ReviewNotionLink notionSlug={s.slug} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <button onClick={retry} className="btn-accent w-full justify-center !rounded-2xl !py-3 sm:w-auto sm:px-10">
            Retry — new shuffled round
          </button>
          <div className="mt-1 flex items-center gap-4">
            <button
              onClick={backToSetup}
              className="text-sm font-medium text-muted transition hover:text-primary"
            >
              Change focus
            </button>
            <button
              onClick={onExit}
              className="text-sm font-medium text-muted transition hover:text-primary"
            >
              Back to grammar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ────────────────────────────────────────────────────────
  if (!current) return null;

  const wasCorrect = picked !== null && picked === current.answer;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between text-sm text-muted">
        <span>
          Question {index + 1} / {total}
        </span>
        <button
          onClick={onExit}
          className="text-sm font-medium text-muted transition hover:text-primary"
        >
          Exit quiz
        </button>
      </div>

      <div className="progress-track mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <div className="jp text-2xl leading-relaxed text-ink sm:text-3xl">
          {stripEnglishHint(current.question)}
        </div>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowGloss((v) => !v)}
            aria-expanded={showGloss}
            aria-label={
              showGloss ? "Hide English translation" : "Show English translation"
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
              showGloss
                ? "bg-primary text-white"
                : "bg-soft text-muted hover:bg-primary-50 hover:text-primary"
            }`}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold italic">
              i
            </span>
            {showGloss ? "Hide translation" : "View translation"}
          </button>
        </div>
        {showGloss && (
          <p className="mt-2 text-sm text-muted">{current.sentence_gloss}</p>
        )}
      </div>

      <div className="mt-7 grid grid-cols-1 gap-2.5">
        {current.shuffledChoices.map((choice) => {
          const isCorrectChoice = choice === current.answer;
          const isPickedChoice = choice === picked;
          let cls =
            "jp rounded-2xl border-2 border-border bg-white px-4 py-3 text-left text-lg text-ink shadow-soft transition hover:border-primary-200 hover:bg-primary-50";
          if (picked !== null) {
            if (isCorrectChoice) {
              cls =
                "jp rounded-2xl border-2 border-success bg-success-50 px-4 py-3 text-left text-lg text-success-700 shadow-soft";
            } else if (isPickedChoice) {
              cls =
                "jp rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-3 text-left text-lg text-red-700 shadow-soft";
            } else {
              cls =
                "jp rounded-2xl border-2 border-border bg-white px-4 py-3 text-left text-lg text-ink opacity-50 shadow-soft";
            }
          }
          return (
            <button
              key={choice}
              type="button"
              onClick={() => pick(choice)}
              disabled={picked !== null}
              className={cls}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          className={`mt-5 rounded-2xl p-4 ${
            wasCorrect ? "bg-success-50" : "bg-red-50"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              wasCorrect ? "text-success-700" : "text-red-700"
            }`}
          >
            {wasCorrect ? "正解！ Correct." : "Not quite."}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-sumi">
            {current.explanation}
          </p>
          <div
            className={`mt-3 flex items-center gap-3 ${
              wasCorrect ? "justify-end" : "justify-between"
            }`}
          >
            {!wasCorrect && <ReviewNotionLink notionSlug={current.notion} />}
            <button onClick={advance} className="btn-primary">
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScopePill({
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
      className={`jp rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        selected
          ? "bg-primary text-white shadow-soft"
          : "bg-soft text-sumi hover:bg-primary-50"
      }`}
    >
      {label}
    </button>
  );
}

function CountPill({
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
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        selected
          ? "bg-accent text-primary shadow-soft"
          : "bg-soft text-sumi hover:bg-accent-100"
      }`}
    >
      {label}
    </button>
  );
}
