"use client";

import { useEffect, useRef, useState } from "react";
import { toHiragana } from "wanakana";
import type { KanjiFields } from "@/components/KanjiQuizClient";
import {
  formatKunyomi,
  getKunyomiAnswer,
} from "@/lib/kanjiReadings";

type Props = {
  fields: KanjiFields;
  onAnswered: (wasCorrect: boolean) => void;
  onNext: () => void;
};

type Status = "asking" | "correct" | "wrong";

function normalize(s: string): string {
  return (s ?? "").trim().normalize("NFC").toLowerCase();
}

function checkMeaning(input: string, meanings: string[]): boolean {
  const n = normalize(input);
  if (!n) return false;
  return meanings.some((m) => normalize(m) === n);
}

// Try the literal input AND a romaji-converted version, against every
// reading in the supplied list. For dictionary-style entries like
// "なが.い", ONLY the kanji-only part ("なが") counts as correct.
// Adding the okurigana (typing "ながい") is intentionally not accepted.
function checkReading(input: string, list: string[]): boolean {
  const raw = input.trim();
  if (!raw) return false;
  const candidates = new Set<string>([
    normalize(raw),
    normalize(toHiragana(raw)),
  ]);
  return list.some((r) => candidates.has(normalize(getKunyomiAnswer(r))));
}

export default function KanjiRecognitionCard({
  fields,
  onAnswered,
  onNext,
}: Props) {
  const hasKun = fields.kunyomi.length > 0;
  const hasOn = fields.onyomi.length > 0;

  const [meaning, setMeaning] = useState("");
  const [kun, setKun] = useState("");
  const [on, setOn] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [meaningOk, setMeaningOk] = useState<boolean | null>(null);
  const [kunOk, setKunOk] = useState<boolean | null>(null);
  const [onOk, setOnOk] = useState<boolean | null>(null);

  const meaningRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    meaningRef.current?.focus();
  }, []);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "asking") return;
    const mOk = checkMeaning(meaning, fields.meanings);
    const kOk = hasKun ? checkReading(kun, fields.kunyomi) : true;
    const oOk = hasOn ? checkReading(on, fields.onyomi) : true;
    setMeaningOk(mOk);
    setKunOk(hasKun ? kOk : null);
    setOnOk(hasOn ? oOk : null);
    if (mOk && kOk && oOk) {
      setStatus("correct");
      onAnswered(true);
      window.setTimeout(onNext, 1500);
    } else {
      setStatus("wrong");
      onAnswered(false);
    }
  }

  function retry() {
    setStatus("asking");
    setMeaningOk(null);
    setKunOk(null);
    setOnOk(null);
    meaningRef.current?.focus();
  }

  function skip() {
    onNext();
  }

  return (
    <div className="rounded-lg border border-border bg-white p-8 shadow-card">
      {/* Kanji */}
      <div className="mb-6 text-center">
        <div className="jp text-[120px] leading-none">{fields.kanji}</div>
      </div>

      <form onSubmit={check} className="space-y-4" autoComplete="off">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted">
            Meaning (English)
          </label>
          <input
            ref={meaningRef}
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            disabled={status === "correct"}
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. to eat"
            className={`input mt-1 text-center text-lg ${
              meaningOk === false ? "border-accent ring-2 ring-accent/20" : ""
            } ${
              meaningOk === true
                ? "border-green-600 ring-2 ring-green-600/20"
                : ""
            }`}
          />
        </div>

        {hasKun && (
          <div>
            <label className="text-xs uppercase tracking-wide text-muted">
              Kun&apos;yomi (hiragana or romaji)
            </label>
            <input
              value={kun}
              onChange={(e) => setKun(e.target.value)}
              disabled={status === "correct"}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. naga / なが"
              className={`input jp mt-1 text-center text-lg ${
                kunOk === false ? "border-accent ring-2 ring-accent/20" : ""
              } ${
                kunOk === true
                  ? "border-green-600 ring-2 ring-green-600/20"
                  : ""
              }`}
            />
            <p className="mt-1 text-xs text-muted">
              Type only the kanji reading (e.g.{" "}
              <span className="jp">なが</span> for{" "}
              <span className="jp">長</span>, not{" "}
              <span className="jp">ながい</span>).
            </p>
          </div>
        )}

        {hasOn && (
          <div>
            <label className="text-xs uppercase tracking-wide text-muted">
              On&apos;yomi (hiragana or romaji)
            </label>
            <input
              value={on}
              onChange={(e) => setOn(e.target.value)}
              disabled={status === "correct"}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. shoku / しょく"
              className={`input jp mt-1 text-center text-lg ${
                onOk === false ? "border-accent ring-2 ring-accent/20" : ""
              } ${
                onOk === true
                  ? "border-green-600 ring-2 ring-green-600/20"
                  : ""
              }`}
            />
          </div>
        )}

        {!hasKun && !hasOn && (
          <p className="text-center text-xs text-muted">
            This kanji has no kun&apos;yomi or on&apos;yomi listed — just confirm
            the meaning.
          </p>
        )}

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
          <div className="rounded-md border border-green-600/30 bg-green-50 p-4">
            <div className="text-center text-sm font-medium text-green-800">
              正解！ Correct.
            </div>
            {fields.examples.length > 0 && (
              <div className="mt-3 text-center">
                <div className="text-xs uppercase tracking-wide text-muted">
                  Examples
                </div>
                <ul className="mt-2 space-y-1">
                  {fields.examples.map((ex, i) => (
                    <li key={i} className="text-sm">
                      <span className="jp">{ex.word}</span>
                      <span className="jp ml-2 text-muted">({ex.reading})</span>
                      <span className="ml-2 text-muted">— {ex.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {status === "wrong" && (
          <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
            <div className="text-center text-xs uppercase tracking-wide text-accent">
              Answer
            </div>
            <div className="mt-2 space-y-2 text-center text-sm">
              <div>
                <span className="text-muted">Meaning:</span>{" "}
                {fields.meanings.join(", ")}
              </div>
              {fields.kunyomi.length > 0 && (
                <div>
                  <span className="text-muted">Kun&apos;yomi:</span>{" "}
                  <span className="jp">
                    {fields.kunyomi.map(formatKunyomi).join("、")}
                  </span>
                </div>
              )}
              {fields.onyomi.length > 0 && (
                <div>
                  <span className="text-muted">On&apos;yomi:</span>{" "}
                  <span className="jp">{fields.onyomi.join("、")}</span>
                </div>
              )}
              {fields.examples.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs uppercase tracking-wide text-muted">
                    Examples
                  </div>
                  <ul className="mt-1 space-y-1">
                    {fields.examples.map((ex, i) => (
                      <li key={i} className="text-sm">
                        <span className="jp">{ex.word}</span>
                        <span className="jp ml-2 text-muted">
                          ({ex.reading})
                        </span>
                        <span className="ml-2 text-muted">— {ex.meaning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
