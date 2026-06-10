"use client";

import { useEffect, useRef, useState } from "react";
import { toHiragana } from "wanakana";

export type WordItem = {
  word: string;
  reading: string;
  meaning: string;
  parent_kanji: string;
  parent_meaning: string;
};

type Props = {
  item: WordItem;
  onAnswered: (wasCorrect: boolean) => void;
  onNext: () => void;
};

type Status = "asking" | "correct" | "wrong";

function normalize(s: string): string {
  return (s ?? "").trim().normalize("NFC").toLowerCase();
}

function checkReading(input: string, expected: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  const e = normalize(expected);
  return normalize(raw) === e || normalize(toHiragana(raw)) === e;
}

export default function KanjiWordsCard({ item, onAnswered, onNext }: Props) {
  const [reading, setReading] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "asking") return;
    if (checkReading(reading, item.reading)) {
      setStatus("correct");
      onAnswered(true);
      window.setTimeout(onNext, 1500);
    } else {
      setStatus("wrong");
      onAnswered(false);
    }
  }

  function retry() {
    setReading("");
    setStatus("asking");
    inputRef.current?.focus();
  }

  function skip() {
    onNext();
  }

  return (
    <div className="rounded-lg border border-border bg-white p-8 shadow-card">
      {/* Word */}
      <div className="mb-2 text-center">
        <div className="jp text-6xl leading-none">{item.word}</div>
        <div className="mt-3 text-sm text-muted">{item.meaning}</div>
      </div>

      <form onSubmit={check} className="mt-6 space-y-3" autoComplete="off">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted">
            Reading (hiragana or romaji)
          </label>
          <input
            ref={inputRef}
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            disabled={status === "correct"}
            autoComplete="off"
            spellCheck={false}
            placeholder="ひらがな…"
            className={`input jp mt-1 text-center text-2xl ${
              status === "wrong" ? "border-accent ring-2 ring-accent/20" : ""
            } ${
              status === "correct"
                ? "border-green-600 ring-2 ring-green-600/20"
                : ""
            }`}
          />
        </div>

        {status === "asking" && (
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={skip} className="btn-ghost">
              Skip
            </button>
            <button type="submit" className="btn-primary">
              Check
            </button>
          </div>
        )}

        {status === "correct" && (
          <div className="text-center text-green-700">正解！ Correct.</div>
        )}

        {status === "wrong" && (
          <div className="rounded-md border border-accent/30 bg-accent/5 p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-accent">
              Answer
            </div>
            <div className="jp mt-1 text-2xl">{item.reading}</div>
            <div className="mt-2 text-sm text-muted">
              — uses <span className="jp">{item.parent_kanji}</span>
              {item.parent_meaning && <> ({item.parent_meaning})</>}
            </div>
            <div className="mt-4 flex justify-center gap-2">
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
  );
}
