"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Card, ScriptType } from "@/lib/types";

type Props = {
  cards: Card[];
  moduleType: "quiz" | "conjugation";
  levelId: string;
  script: ScriptType;
};

type Status = "asking" | "correct" | "wrong";

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

export default function QuizClient({ cards, moduleType, levelId }: Props) {
  const [order, setOrder] = useState<Card[]>(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [firstTryThisCard, setFirstTryThisCard] = useState(true);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [done, setDone] = useState(false);
  const [savedSession, setSavedSession] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = order.length;
  const card = order[index];

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

  // Re-focus input when a new card comes up.
  useEffect(() => {
    if (status === "asking") inputRef.current?.focus();
  }, [status, index]);

  // Save the session once we hit the end screen.
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
        // Don't block the UI on a failed save.
      }
    })();
  }, [done, savedSession, levelId, total, correctFirstTry]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "asking" || !card) return;

    if (normalize(answer) === normalize(expected)) {
      setStatus("correct");
      if (firstTryThisCard) setCorrectFirstTry((n) => n + 1);
      // Auto-advance.
      window.setTimeout(() => advance(), 1100);
    } else {
      setStatus("wrong");
      setFirstTryThisCard(false);
    }
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
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function reset() {
    setOrder(shuffle(cards));
    setIndex(0);
    setAnswer("");
    setStatus("asking");
    setFirstTryThisCard(true);
    setCorrectFirstTry(0);
    setDone(false);
    setSavedSession(false);
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
          <a href="./" className="btn-outline">
            Back to levels
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} / {total}
        </span>
        <button onClick={reset} className="hover:text-ink underline-offset-2 hover:underline">
          Reshuffle
        </button>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 shadow-card">
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
              status === "wrong" ? "border-accent ring-2 ring-accent/20" : ""
            } ${status === "correct" ? "border-green-600 ring-2 ring-green-600/20" : ""}`}
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
            <div className="mt-4 text-center text-green-700">正解！ Correct.</div>
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
                <button type="button" onClick={retry} className="btn-outline">
                  Try again
                </button>
                <button type="button" onClick={skip} className="btn-primary">
                  Next
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
