"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

type Props = {
  cards: Card[];
  levelId: string;
  // Final Boss mode: pick 10 random cards each session.
  isFinalBoss?: boolean;
};

type Fields = {
  counter_type: string;
  value: number | string;
  reading?: string;
  question_word?: string;
  standard_reading?: string;
  honorific_reading?: string;
  question_word_standard?: string;
  question_word_honorific?: string;
  emoji: string;
  emoji_label?: string;
  is_question_card: boolean;
};

type Status = "asking" | "correct" | "wrong";

function parseFields(c: Card): Fields {
  const f = c.fields as any;
  return {
    counter_type: f.counter_type ?? "",
    value: f.value,
    reading: f.reading,
    question_word: f.question_word,
    standard_reading: f.standard_reading,
    honorific_reading: f.honorific_reading,
    question_word_standard: f.question_word_standard,
    question_word_honorific: f.question_word_honorific,
    emoji: f.emoji ?? "",
    emoji_label: f.emoji_label,
    is_question_card: !!f.is_question_card,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function buildOrder(cards: Card[], isFinalBoss: boolean): Card[] {
  return isFinalBoss ? pickRandom(cards, 10) : shuffle(cards);
}

function normalize(s: string): string {
  return s.trim().normalize("NFC").toLowerCase();
}

// Accepts slash-separated alternates ("ななにん / しちにん").
function check(input: string, expected: string): boolean {
  const norm = normalize(input);
  const alts = expected.split("/").map((s) => normalize(s));
  return alts.some((a) => a === norm && a.length > 0);
}

export default function CountingQuizClient({
  cards,
  levelId,
  isFinalBoss = false,
}: Props) {
  const [order, setOrder] = useState<Card[]>(() =>
    buildOrder(cards, isFinalBoss)
  );
  const [index, setIndex] = useState(0);

  const [single, setSingle] = useState("");
  const [std, setStd] = useState("");
  const [hon, setHon] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [results, setResults] = useState<{ std: boolean; hon: boolean } | null>(
    null
  );
  const [firstTry, setFirstTry] = useState(true);

  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [done, setDone] = useState(false);
  const [savedSession, setSavedSession] = useState(false);

  const [cheatOpen, setCheatOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const total = order.length;
  const card = order[index];
  const fields = useMemo(() => (card ? parseFields(card) : null), [card]);
  const isPeople = fields?.counter_type === "nin_mei";

  // Defensive per-card reset.
  useEffect(() => {
    setSingle("");
    setStd("");
    setHon("");
    setStatus("asking");
    setResults(null);
    setFirstTry(true);
  }, [index]);

  useEffect(() => {
    if (status === "asking") inputRef.current?.focus();
  }, [status, index]);

  // Cheat-sheet content: same cards already loaded for the quiz, sorted by
  // numeric value with question (?) cards at the end.
  const cheatSheet = useMemo(() => {
    const list = order.map((c) => ({ card: c, fields: parseFields(c) }));
    return list.sort((a, b) => {
      const aIsQ = a.fields.is_question_card || a.fields.value === "?";
      const bIsQ = b.fields.is_question_card || b.fields.value === "?";
      if (aIsQ && bIsQ) return 0;
      if (aIsQ) return 1;
      if (bIsQ) return -1;
      const av = typeof a.fields.value === "number" ? a.fields.value : Number(a.fields.value);
      const bv = typeof b.fields.value === "number" ? b.fields.value : Number(b.fields.value);
      return av - bv;
    });
  }, [order]);

  // Dismiss cheat sheet on Escape.
  useEffect(() => {
    if (!cheatOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCheatOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cheatOpen]);

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
        /* silent */
      }
    })();
  }, [done, savedSession, levelId, total, correctFirstTry]);

  function expectedSingle(): string {
    if (!fields) return "";
    return fields.is_question_card
      ? fields.question_word ?? ""
      : fields.reading ?? "";
  }

  function expectedPeople(): { std: string; hon: string } {
    if (!fields) return { std: "", hon: "" };
    if (fields.is_question_card) {
      return {
        std: fields.question_word_standard ?? "",
        hon: fields.question_word_honorific ?? "",
      };
    }
    return {
      std: fields.standard_reading ?? "",
      hon: fields.honorific_reading ?? "",
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields || status !== "asking") return;

    if (isPeople) {
      const exp = expectedPeople();
      const r = { std: check(std, exp.std), hon: check(hon, exp.hon) };
      setResults(r);
      if (r.std && r.hon) {
        setStatus("correct");
        if (firstTry) setCorrectFirstTry((n) => n + 1);
        window.setTimeout(advance, 1500);
      } else {
        setStatus("wrong");
        setFirstTry(false);
      }
    } else {
      if (check(single, expectedSingle())) {
        setStatus("correct");
        if (firstTry) setCorrectFirstTry((n) => n + 1);
        window.setTimeout(advance, 1500);
      } else {
        setStatus("wrong");
        setFirstTry(false);
      }
    }
  }

  function retry() {
    setStatus("asking");
    setResults(null);
    inputRef.current?.focus();
  }

  function skip() {
    advance();
  }

  function advance() {
    if (index + 1 >= total) setDone(true);
    else setIndex((i) => i + 1);
  }

  function reset() {
    setOrder(buildOrder(cards, isFinalBoss));
    setIndex(0);
    setCorrectFirstTry(0);
    setDone(false);
    setSavedSession(false);
    setSingle("");
    setStd("");
    setHon("");
    setStatus("asking");
    setResults(null);
    setFirstTry(true);
  }

  // ─── Done screen ───
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
        <div className="flex flex-col items-center gap-2">
          <button onClick={reset} className="btn-primary">
            {isFinalBoss ? "New 10 cards" : "Restart"}
          </button>
          <Link href="/modules/counting" className="btn-outline">
            Back to levels
          </Link>
        </div>
      </div>
    );
  }

  if (!fields || !card) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
        No cards available.
      </p>
    );
  }

  const showValue = !fields.is_question_card;
  const exp = isPeople ? expectedPeople() : null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} / {total}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="hover:text-ink underline-offset-2 hover:underline"
          >
            {isFinalBoss ? "New 10" : "Reshuffle"}
          </button>
          <button
            onClick={() => setCheatOpen(true)}
            className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-card hover:bg-soft"
          >
            Cheat Sheet
          </button>
        </div>
      </div>

      <CheatSheetPanel
        open={cheatOpen}
        onClose={() => setCheatOpen(false)}
        items={cheatSheet}
      />


      <div className="rounded-lg border border-border bg-white p-8 shadow-card">
        {/* Emoji canvas */}
        <div className="mb-3 flex min-h-[80px] items-center justify-center text-center text-5xl leading-tight">
          <span className="break-words">{fields.emoji}</span>
        </div>

        {/* Sub-label */}
        <div className="mb-6 text-center">
          {fields.is_question_card ? (
            <div className="text-base text-muted">
              How do you ask &ldquo;how many&rdquo;?
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold">{String(fields.value)}</div>
              {fields.emoji_label && (
                <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                  {fields.emoji_label}
                </div>
              )}
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          {isPeople ? (
            <>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted">
                  Standard (〜にん)
                </label>
                <input
                  ref={inputRef}
                  value={std}
                  onChange={(e) => setStd(e.target.value)}
                  disabled={status === "correct"}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ひらがな…"
                  className={`input jp mt-1 text-center text-xl ${
                    results?.std === false
                      ? "border-accent ring-2 ring-accent/20"
                      : ""
                  } ${
                    results?.std === true
                      ? "border-green-600 ring-2 ring-green-600/20"
                      : ""
                  }`}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted">
                  Honorific (〜めい)
                </label>
                <input
                  value={hon}
                  onChange={(e) => setHon(e.target.value)}
                  disabled={status === "correct"}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ひらがな…"
                  className={`input jp mt-1 text-center text-xl ${
                    results?.hon === false
                      ? "border-accent ring-2 ring-accent/20"
                      : ""
                  } ${
                    results?.hon === true
                      ? "border-green-600 ring-2 ring-green-600/20"
                      : ""
                  }`}
                />
              </div>
            </>
          ) : (
            <input
              ref={inputRef}
              value={single}
              onChange={(e) => setSingle(e.target.value)}
              disabled={status === "correct"}
              autoComplete="off"
              spellCheck={false}
              placeholder="ひらがな…"
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
          )}

          {status === "asking" && (
            <div className="mt-3 flex justify-center gap-3">
              <button type="submit" className="btn-primary">
                Check
              </button>
              <button type="button" onClick={skip} className="btn-ghost">
                Skip
              </button>
            </div>
          )}

          {status === "correct" && (
            <div className="mt-3 text-center text-green-700">正解！ Correct.</div>
          )}

          {status === "wrong" && (
            <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-accent">
                Answer
              </div>
              {isPeople && exp ? (
                <div className="mt-1 space-y-2">
                  <div>
                    <div className="text-xs text-muted">Standard</div>
                    <div className="jp text-xl">{exp.std}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Honorific</div>
                    <div className="jp text-xl">{exp.hon}</div>
                  </div>
                </div>
              ) : (
                <div className="jp mt-1 text-2xl">{expectedSingle()}</div>
              )}
              <div className="mt-3 flex justify-center gap-3">
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
      </div>
    </div>
  );
}

// =============================================================
// Cheat Sheet panel — slides in from the right, overlays content.
// =============================================================
function CheatSheetPanel({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: { card: Card; fields: Fields }[];
}) {
  return (
    <>
      {/* Click-away overlay */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-label="Cheat Sheet"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-[320px] flex-col border-l border-border bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">
            Cheat Sheet
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cheat sheet"
            className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-soft hover:text-ink"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted">Nothing to show.</p>
          ) : (
            <ul className="space-y-3">
              {items.map(({ card, fields: f }) => {
                const isPeople = f.counter_type === "nin_mei";
                let reading = "";
                if (isPeople) {
                  reading = f.is_question_card
                    ? `${f.question_word_standard ?? ""} / ${f.question_word_honorific ?? ""}`
                    : `${f.standard_reading ?? ""} / ${f.honorific_reading ?? ""}`;
                } else {
                  reading = f.is_question_card
                    ? f.question_word ?? ""
                    : f.reading ?? "";
                }

                // Show one emoji + ×N instead of repeating it.
                // The stored emoji is N copies of the same grapheme, so we
                // can slice cleanly using string-length / value, which avoids
                // grapheme-splitting issues with VS16 / ZWJ sequences.
                const numericValue =
                  typeof f.value === "number"
                    ? f.value
                    : Number.isFinite(Number(f.value))
                      ? Number(f.value)
                      : 0;
                const showCount =
                  !f.is_question_card && numericValue > 0 && f.emoji.length > 0;
                const singleEmoji = showCount
                  ? f.emoji.slice(0, f.emoji.length / numericValue)
                  : f.emoji;

                return (
                  <li
                    key={card.id}
                    className="flex items-center gap-3 text-sm leading-relaxed"
                  >
                    <span className="shrink-0 whitespace-nowrap text-xl leading-none">
                      <span className="align-middle">{singleEmoji}</span>
                      {showCount && (
                        <span className="ml-1 align-middle text-sm text-muted">
                          ×{numericValue}
                        </span>
                      )}
                    </span>
                    <span className="text-muted">→</span>
                    <span className="jp">{reading}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
