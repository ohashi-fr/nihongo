"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";
import McqCard, {
  type McqOption,
  buildMcqOptions,
} from "@/components/McqCard";
import PreQuizScreen from "@/components/PreQuizScreen";

type Props = {
  cards: Card[];
  levelId: string;
  // Optional MCQ wiring. When supportsMcq is true, the user first lands
  // on PreQuizScreen to pick Normal vs MCQ; the chosen mode arrives via
  // ?mode= in the URL. Existing callers that omit these props get the
  // text-input flow exactly as before.
  slug?: string;
  levelName?: string;
  supportsMcq?: boolean;
};

type Status = "asking" | "correct" | "wrong";

const WORD_TYPE_LABELS: Record<string, string> = {
  doshi: "動詞 — verb",
  suru_meishi: "する動詞 — suru-verb",
  i_keiyoshi: "い形容詞 — i-adjective",
  na_keiyoshi: "な形容詞 — na-adjective",
  meishi: "名詞 — noun",
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

export default function TranslationQuizClient({
  cards,
  levelId,
  slug,
  levelName,
  supportsMcq = false,
}: Props) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode: "normal" | "mcq" = modeParam === "mcq" ? "mcq" : "normal";

  const needsPreQuiz = supportsMcq && !modeParam;

  const [order, setOrder] = useState<Card[]>(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [firstTryThisCard, setFirstTryThisCard] = useState(true);
  const [matched, setMatched] = useState<"long" | "short" | null>(null);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [done, setDone] = useState(false);
  const [savedSession, setSavedSession] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = order.length;
  const card = order[index];

  const fields = useMemo(() => {
    if (!card) return null;
    const f = card.fields as Record<string, string>;
    return {
      english: f.english ?? "",
      japanese: f.japanese ?? "",
      shortForm: f.short_form ?? "",
      wordType: f.word_type ?? "",
    };
  }, [card]);

  // MCQ is on when the URL says so AND there are enough cards for distractors.
  const useMcq = mode === "mcq" && order.length >= 4;

  // Distractor selection lives in McqCard (buildMcqOptions): same-
  // word_type filter with fallback, plus dedupe on `japanese`.
  const mcqOptions: McqOption[] = useMemo(() => {
    if (!useMcq || !card) return [];
    return buildMcqOptions(card, order);
  }, [useMcq, card, order]);

  function handleMcqAnswered(wasCorrect: boolean) {
    if (wasCorrect) setCorrectFirstTry((n) => n + 1);
  }

  useEffect(() => {
    if (status === "asking") inputRef.current?.focus();
  }, [status, index]);

  useEffect(() => {
    if (!done || savedSession) return;
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
        // silent
      }
    })();
  }, [done, savedSession, levelId, total, correctFirstTry]);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "asking" || !fields) return;
    const a = normalize(answer);
    if (a === normalize(fields.japanese)) {
      setMatched("long");
      setStatus("correct");
      if (firstTryThisCard) setCorrectFirstTry((n) => n + 1);
      window.setTimeout(advance, 1200);
    } else if (fields.shortForm && a === normalize(fields.shortForm)) {
      setMatched("short");
      setStatus("correct");
      if (firstTryThisCard) setCorrectFirstTry((n) => n + 1);
      window.setTimeout(advance, 1400);
    } else {
      setStatus("wrong");
      setFirstTryThisCard(false);
    }
  }

  function retry() {
    setAnswer("");
    setStatus("asking");
    setMatched(null);
    inputRef.current?.focus();
  }

  function skip() {
    advance();
  }

  function advance() {
    setAnswer("");
    setStatus("asking");
    setMatched(null);
    setFirstTryThisCard(true);
    if (index + 1 >= total) setDone(true);
    else setIndex((i) => i + 1);
  }

  function reset() {
    setOrder(shuffle(cards));
    setIndex(0);
    setAnswer("");
    setStatus("asking");
    setMatched(null);
    setFirstTryThisCard(true);
    setCorrectFirstTry(0);
    setDone(false);
    setSavedSession(false);
  }

  // Pre-quiz screen for MCQ-enabled levels before a mode is picked.
  if (needsPreQuiz) {
    return (
      <PreQuizScreen
        slug={slug ?? ""}
        levelId={levelId}
        levelName={levelName ?? ""}
        cardCount={cards.length}
      />
    );
  }

  if (done) {
    const pct = total === 0 ? 0 : Math.round((correctFirstTry / total) * 100);
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-card">
        <div className="jp text-5xl">お疲れ様</div>
        <h2 className="mt-4 text-2xl font-semibold">Done!</h2>
        <p className="mt-2 text-muted">
          {correctFirstTry} / {total} correct on first try
        </p>
        <div className="my-6 text-4xl font-semibold">{pct}%</div>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Restart
          </button>
          <a href="../" className="btn-outline">
            Back to levels
          </a>
        </div>
      </div>
    );
  }

  if (!fields) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>
            Card {index + 1} / {total}
          </span>
          {useMcq && <span className="badge">MCQ</span>}
        </div>
        <button
          onClick={reset}
          className="hover:text-ink underline-offset-2 hover:underline"
        >
          Reshuffle
        </button>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 shadow-card">
        {useMcq ? (
          <McqCard
            key={card.id}
            prompt={fields.english}
            options={mcqOptions}
            onAnswered={handleMcqAnswered}
            onNext={advance}
          />
        ) : (
          <>
        <div className="mb-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted">
            Translate
          </div>
          <div className="mt-2 text-3xl font-medium">{fields.english}</div>
          <div className="mt-2 text-xs text-muted">
            Long form (〜です/〜ます) or dictionary form is fine.
          </div>
        </div>

        <form onSubmit={check}>
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={status !== "asking"}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="ひらがな…"
            className={`input jp text-center text-2xl ${
              status === "wrong" ? "border-accent ring-2 ring-accent/20" : ""
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
              正解！ Correct
              {matched === "short" && (
                <span className="ml-1 text-muted">— short form</span>
              )}
              {matched === "long" && (
                <span className="ml-1 text-muted">— long form</span>
              )}
              .
            </div>
          )}

          {status === "wrong" && (
            <div className="mt-4 rounded-md border border-accent/30 bg-accent/5 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-accent">
                Answer
              </div>
              <div className="jp mt-1 text-2xl">{fields.japanese}</div>
              {fields.shortForm && (
                <div className="mt-1 text-sm text-muted">
                  short form: <span className="jp">{fields.shortForm}</span>
                </div>
              )}
              {fields.wordType && (
                <div className="mt-2 text-xs text-muted">
                  {WORD_TYPE_LABELS[fields.wordType] ?? fields.wordType}
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
