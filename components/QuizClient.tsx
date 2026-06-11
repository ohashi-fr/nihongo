"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Card, ScriptType } from "@/lib/types";
import McqCard, {
  type McqOption,
  buildMcqOptions,
} from "@/components/McqCard";
import PreQuizScreen from "@/components/PreQuizScreen";
import VerbFlashcardClient from "@/components/VerbFlashcardClient";

type Props = {
  cards: Card[];
  moduleType: "quiz" | "conjugation";
  levelId: string;
  slug: string;
  levelName: string;
  script: ScriptType;
  // When true, the user first lands on a PreQuizScreen to pick a mode.
  // The chosen mode comes back via the `?mode=` URL param.
  supportsMcq?: boolean;
};

type Status = "asking" | "correct" | "wrong";
type Phase = "prep" | "playing" | "done";
type ScriptFilter = "hiragana" | "katakana" | "both";

const FILTER_LABELS: Record<ScriptFilter, { jp: string; en: string }> = {
  hiragana: { jp: "ひらがな", en: "Hiragana only" },
  katakana: { jp: "カタカナ", en: "Katakana only" },
  both: { jp: "両方", en: "Both" },
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return s.trim().normalize("NFC").toLowerCase();
}

function applyFilter(cards: Card[], filter: ScriptFilter): Card[] {
  if (filter === "both") return cards;
  return cards.filter((c) => (c.fields as any).script === filter);
}

// Show the toggle UI only if cards expose a per-card script (vocabulary-style),
// AND the module is the simple quiz type. Conjugation prompts use other clients.
function cardsHaveScripts(cards: Card[]): boolean {
  return cards.some((c) => Boolean((c.fields as any)?.script));
}

export default function QuizClient({
  cards,
  moduleType,
  levelId,
  slug,
  levelName,
  script,
  supportsMcq = false,
}: Props) {
  const searchParams = useSearchParams();

  // Verb-flashcard levels live inside the vocabulary module but use an
  // entirely different UI. Route them out of this component as early as
  // possible. `cards` is a stable server prop within a route, so this
  // conditional return is hook-safe.
  const isVerbFlashcardLevel = useMemo(
    () =>
      cards.length > 0 &&
      cards.every(
        (c) => (c.fields as any)?.card_type === "verb_flashcard"
      ),
    [cards]
  );

  if (isVerbFlashcardLevel) {
    return (
      <VerbFlashcardClient
        cards={cards}
        slug={slug}
        levelId={levelId}
        levelName={levelName}
      />
    );
  }

  const modeParam = searchParams.get("mode");
  const mode: "normal" | "mcq" = modeParam === "mcq" ? "mcq" : "normal";

  // TEMP: confirm the URL param is being read. Remove after verifying.
  // eslint-disable-next-line no-console
  console.log("[QuizClient] mode read from URL:", modeParam, "→", mode);

  // Show the pre-quiz screen only for MCQ-enabled levels and only on the
  // first visit (before a mode has been picked). Once `?mode=` is in the
  // URL we render the actual quiz.
  const needsPreQuiz = supportsMcq && !modeParam;

  const showFilter = moduleType === "quiz" && cardsHaveScripts(cards);

  // Default the filter to the level's own script when sensible.
  const initialFilter: ScriptFilter =
    showFilter && (script === "hiragana" || script === "katakana")
      ? script
      : "both";

  const [phase, setPhase] = useState<Phase>(showFilter ? "prep" : "playing");
  const [scriptFilter, setScriptFilter] = useState<ScriptFilter>(initialFilter);
  const [order, setOrder] = useState<Card[]>(() =>
    showFilter ? [] : shuffle(cards)
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [firstTryThisCard, setFirstTryThisCard] = useState(true);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [savedSession, setSavedSession] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = order.length;
  const card = order[index];

  const counts = useMemo(
    () => ({
      hiragana: cards.filter((c) => (c.fields as any).script === "hiragana")
        .length,
      katakana: cards.filter((c) => (c.fields as any).script === "katakana")
        .length,
      both: cards.length,
    }),
    [cards]
  );

  const prompt = useMemo(() => {
    if (!card) return { primary: "", secondary: "" };
    const f = card.fields as any;
    if (moduleType === "quiz") {
      return { primary: f.english ?? "", secondary: "" };
    }
    return { primary: f.verb ?? "", secondary: f.form ?? "" };
  }, [card, moduleType]);

  const expected = useMemo(() => {
    if (!card) return "";
    const f = card.fields as any;
    return moduleType === "quiz" ? f.japanese ?? "" : f.answer ?? "";
  }, [card, moduleType]);

  // MCQ is only available for the simple `quiz` module type and only when
  // the current playing set has at least 4 cards (3 distractors + 1 correct).
  // Otherwise we silently fall back to the text-input flow.
  const useMcq = mode === "mcq" && moduleType === "quiz" && order.length >= 4;

  // Distractor selection lives in McqCard (buildMcqOptions): same-
  // word_type filter with fallback, plus dedupe on `japanese`.
  // Re-rolls each card.
  const mcqOptions: McqOption[] = useMemo(() => {
    if (!useMcq || !card) return [];
    return buildMcqOptions(card, order);
  }, [useMcq, card, order]);

  // Re-focus input on each new card.
  useEffect(() => {
    if (phase === "playing" && status === "asking") inputRef.current?.focus();
  }, [phase, status, index]);

  // Save the session once we hit the end screen.
  useEffect(() => {
    if (phase !== "done" || savedSession) return;
    (async () => {
      try {
        const supabase = createClient();
        await supabase.from("sessions").insert({
          level_id: levelId,
          total_cards: total,
          correct_first_try: correctFirstTry,
        });
        setSavedSession(true);
      } catch {
        // Don't block the UI on a failed save.
      }
    })();
  }, [phase, savedSession, levelId, total, correctFirstTry]);

  function startQuiz(filter: ScriptFilter) {
    const filtered = applyFilter(cards, filter);
    if (filtered.length === 0) return;
    setScriptFilter(filter);
    setOrder(shuffle(filtered));
    setIndex(0);
    setAnswer("");
    setStatus("asking");
    setFirstTryThisCard(true);
    setCorrectFirstTry(0);
    setSavedSession(false);
    setPhase("playing");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "asking" || !card) return;

    if (normalize(answer) === normalize(expected)) {
      setStatus("correct");
      if (firstTryThisCard) setCorrectFirstTry((n) => n + 1);
      window.setTimeout(() => advance(), 1100);
    } else {
      setStatus("wrong");
      setFirstTryThisCard(false);
    }
  }

  // Called by McqCard once the user picks an option. We only count the
  // first attempt — the user gets a single click per card in MCQ mode.
  function handleMcqAnswered(wasCorrect: boolean) {
    if (wasCorrect) setCorrectFirstTry((n) => n + 1);
  }

  function retry() {
    setAnswer("");
    setStatus("asking");
    inputRef.current?.focus();
  }

  function skip() {
    advance();
  }

  function advance() {
    setAnswer("");
    setStatus("asking");
    setFirstTryThisCard(true);
    if (index + 1 >= total) {
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
    }
  }

  function reshuffle() {
    setOrder((o) => shuffle(o));
    setIndex(0);
    setAnswer("");
    setStatus("asking");
    setFirstTryThisCard(true);
  }

  function backToPrep() {
    setPhase(showFilter ? "prep" : "playing");
    setSavedSession(false);
  }

  // ─── PRE-QUIZ screen (only on MCQ-enabled levels, before mode is picked)
  if (needsPreQuiz) {
    return (
      <PreQuizScreen
        slug={slug}
        levelId={levelId}
        levelName={levelName}
        cardCount={cards.length}
      />
    );
  }

  // ─── PREP screen ──────────────────────────────────────────────────────
  if (phase === "prep") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 shadow-card">
        <div className="text-center">
          <div className="jp text-4xl">どれを練習する？</div>
          <h2 className="mt-3 text-xl font-semibold">Pick a script</h2>
          <p className="mt-2 text-sm text-muted">
            Filter the deck before you start.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <FilterButton
            filter="hiragana"
            count={counts.hiragana}
            selected={scriptFilter === "hiragana"}
            onClick={() => startQuiz("hiragana")}
          />
          <FilterButton
            filter="katakana"
            count={counts.katakana}
            selected={scriptFilter === "katakana"}
            onClick={() => startQuiz("katakana")}
          />
          <FilterButton
            filter="both"
            count={counts.both}
            selected={scriptFilter === "both"}
            onClick={() => startQuiz("both")}
          />
        </div>
      </div>
    );
  }

  // ─── DONE screen ──────────────────────────────────────────────────────
  if (phase === "done") {
    const pct = total === 0 ? 0 : Math.round((correctFirstTry / total) * 100);
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-card">
        <div className="jp text-5xl">お疲れ様</div>
        <h2 className="mt-4 text-2xl font-semibold">Done!</h2>
        <p className="mt-2 text-muted">
          {correctFirstTry} / {total} correct on first try
        </p>
        <div className="my-6 text-4xl font-semibold">{pct}%</div>
        <div className="flex flex-col items-center gap-2">
          {showFilter && (
            <button onClick={backToPrep} className="btn-primary">
              Pick another script
            </button>
          )}
          <button onClick={() => startQuiz(scriptFilter)} className="btn-outline">
            Restart this set
          </button>
          <Link href={`/modules/${slug}`} className="btn-ghost">
            Back to levels
          </Link>
        </div>
      </div>
    );
  }

  // ─── PLAYING screen ───────────────────────────────────────────────────
  if (!card) {
    // Edge case: filter produced 0 cards somehow. Send the user back to prep.
    return (
      <div className="mx-auto max-w-md rounded-lg border border-dashed border-border bg-white/50 p-6 text-center text-muted">
        No cards match this filter.
        {showFilter && (
          <div className="mt-3">
            <button onClick={backToPrep} className="btn-primary">
              Pick another script
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>
            Card {index + 1} / {total}
          </span>
          {showFilter && (
            <span className="badge jp">
              {FILTER_LABELS[scriptFilter].jp}
            </span>
          )}
          {useMcq && <span className="badge">MCQ</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reshuffle}
            className="hover:text-ink underline-offset-2 hover:underline"
          >
            Reshuffle
          </button>
          {showFilter && (
            <button
              onClick={backToPrep}
              className="hover:text-ink underline-offset-2 hover:underline"
            >
              Change filter
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 shadow-card">
        {useMcq ? (
          <McqCard
            key={card.id}
            prompt={prompt.primary}
            options={mcqOptions}
            onAnswered={handleMcqAnswered}
            onNext={advance}
          />
        ) : (
          <>
            <div className="mb-6 text-center">
              {moduleType === "conjugation" && prompt.secondary && (
                <div className="text-xs uppercase tracking-[0.25em] text-muted">
                  {prompt.secondary}
                </div>
              )}
              <div
                className={
                  moduleType === "quiz"
                    ? "mt-2 text-3xl font-medium"
                    : "jp mt-2 text-4xl"
                }
              >
                {prompt.primary}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={status !== "asking"}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder={moduleType === "quiz" ? "日本語で…" : "answer"}
                className={`input jp text-center text-2xl ${
                  status === "wrong"
                    ? "border-accent ring-2 ring-accent/20"
                    : ""
                } ${
                  status === "correct"
                    ? "border-green-600 ring-2 ring-green-600/20"
                    : ""
                }`}
              />

              {status === "asking" && (
                <div className="mt-4 flex justify-center gap-3">
                  <button type="submit" className="btn-primary">
                    Check
                  </button>
                  <button type="button" onClick={skip} className="btn-ghost">
                    Skip
                  </button>
                </div>
              )}

              {status === "correct" && (
                <div className="mt-4 text-center text-green-700">
                  正解！ Correct.
                </div>
              )}

              {status === "wrong" && (
                <div className="mt-4 rounded-md border border-accent/30 bg-accent/5 p-4 text-center">
                  <div className="text-xs uppercase tracking-wide text-accent">
                    Answer
                  </div>
                  <div className="jp mt-1 text-2xl">{expected}</div>
                  {(card.fields as any).note && (
                    <div className="mt-2 text-sm text-muted">
                      {(card.fields as any).note}
                    </div>
                  )}
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={retry}
                      className="btn-outline"
                    >
                      Try again
                    </button>
                    <button
                      type="button"
                      onClick={skip}
                      className="btn-primary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  filter,
  count,
  selected,
  onClick,
}: {
  filter: ScriptFilter;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  const disabled = count === 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn justify-between ${
        selected ? "bg-ink text-paper" : "btn-outline"
      } ${disabled ? "opacity-40" : ""}`}
    >
      <span className="flex items-center gap-3">
        <span className="jp text-base">{FILTER_LABELS[filter].jp}</span>
        <span className="text-xs">{FILTER_LABELS[filter].en}</span>
      </span>
      <span className="text-xs opacity-70">
        {count} {count === 1 ? "card" : "cards"}
      </span>
    </button>
  );
}
