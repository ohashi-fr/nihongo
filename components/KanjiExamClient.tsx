"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toHiragana } from "wanakana";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";
import { parseKanjiFields, type KanjiFields } from "@/components/KanjiQuizClient";

type Props = {
  // Every kanji card across the kanji module (excluding the exam level).
  pool: Card[];
  // levelId of the exam level — used for session insertion.
  levelId: string;
  // Map from card.level_id to that level's display name. Used for the
  // breakdown on the results screen.
  levelNames: Record<string, string>;
};

type ReadQuestion = {
  kind: "read";
  id: string;
  card: KanjiFields;
  levelId: string;
};

type WordQuestion = {
  kind: "word";
  id: string;
  card: KanjiFields;
  word: { word: string; reading: string; meaning: string };
  levelId: string;
};

type Question = ReadQuestion | WordQuestion;

type Status = "asking" | "correct" | "wrong";

type ErrorItem = {
  question: Question;
  userAnswer: string;
};

const EXAM_SIZE = 20;
const ADVANCE_MS = 800;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return (s ?? "").trim().normalize("NFC").toLowerCase();
}

function checkReadingAny(input: string, list: string[]): boolean {
  const raw = input.trim();
  if (!raw) return false;
  const candidates = new Set<string>([
    normalize(raw),
    normalize(toHiragana(raw)),
  ]);
  return list.some((r) => candidates.has(normalize(r)));
}

function checkMeaning(input: string, meanings: string[]): boolean {
  const n = normalize(input);
  if (!n) return false;
  return meanings.some((m) => normalize(m) === n);
}

/**
 * Build the 20-question pool. 60/40 read vs word split, but if a card
 * has no examples it falls back to a read question.
 */
function buildExamPool(pool: Card[]): Question[] {
  if (pool.length === 0) return [];
  const shuffled = shuffle(pool).slice(0, Math.min(EXAM_SIZE, pool.length));
  return shuffled.map((c, i) => {
    const fields = parseKanjiFields(c);
    const wantsWord = Math.random() < 0.4;
    if (wantsWord && fields.examples.length > 0) {
      const ex =
        fields.examples[Math.floor(Math.random() * fields.examples.length)];
      const wq: WordQuestion = {
        kind: "word",
        id: `${c.id}-${i}-w`,
        card: fields,
        word: { word: ex.word, reading: ex.reading, meaning: ex.meaning },
        levelId: (c as any).level_id ?? "",
      };
      return wq;
    }
    const rq: ReadQuestion = {
      kind: "read",
      id: `${c.id}-${i}-r`,
      card: fields,
      levelId: (c as any).level_id ?? "",
    };
    return rq;
  });
}

export default function KanjiExamClient({
  pool,
  levelId,
  levelNames,
}: Props) {
  const [seed, setSeed] = useState(0);
  const questions = useMemo<Question[]>(
    () => buildExamPool(pool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, seed]
  );

  const [index, setIndex] = useState(0);
  const [meaning, setMeaning] = useState("");
  const [kun, setKun] = useState("");
  const [on, setOn] = useState("");
  const [reading, setReading] = useState(""); // for word questions
  const [status, setStatus] = useState<Status>("asking");

  const [score, setScore] = useState(0);
  const [perLevelCorrect, setPerLevelCorrect] = useState<
    Record<string, number>
  >({});
  const [perLevelTotal, setPerLevelTotal] = useState<Record<string, number>>(
    {}
  );
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [done, setDone] = useState(false);
  const [savedSession, setSavedSession] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const total = questions.length;
  const q = questions[index];

  // Pre-compute per-level totals once for the breakdown.
  useEffect(() => {
    const totals: Record<string, number> = {};
    for (const item of questions) {
      totals[item.levelId] = (totals[item.levelId] ?? 0) + 1;
    }
    setPerLevelTotal(totals);
    setPerLevelCorrect({});
  }, [questions]);

  // Reset per-question state on advance.
  useEffect(() => {
    setMeaning("");
    setKun("");
    setOn("");
    setReading("");
    setStatus("asking");
    // Auto-focus the first input.
    window.setTimeout(() => firstInputRef.current?.focus(), 30);
  }, [index]);

  // Save session on done.
  useEffect(() => {
    if (!done || savedSession) return;
    (async () => {
      try {
        const supabase = createClient();
        await supabase.from("sessions").insert({
          level_id: levelId,
          total_cards: total,
          correct_first_try: score,
        });
        setSavedSession(true);
      } catch {
        /* silent */
      }
    })();
  }, [done, savedSession, levelId, total, score]);

  function advance() {
    if (index + 1 >= total) setDone(true);
    else setIndex((i) => i + 1);
  }

  function submitRead(e: React.FormEvent) {
    e.preventDefault();
    if (!q || q.kind !== "read" || status !== "asking") return;
    const f = q.card;
    const hasKun = f.kunyomi.length > 0;
    const hasOn = f.onyomi.length > 0;
    const mOk = checkMeaning(meaning, f.meanings);
    const kOk = hasKun ? checkReadingAny(kun, f.kunyomi) : true;
    const oOk = hasOn ? checkReadingAny(on, f.onyomi) : true;
    const ok = mOk && kOk && oOk;
    finish(ok, formatUserReadAnswer({ meaning, kun, on, hasKun, hasOn }));
  }

  function submitWord(e: React.FormEvent) {
    e.preventDefault();
    if (!q || q.kind !== "word" || status !== "asking") return;
    const expected = q.word.reading;
    const ok =
      normalize(reading) === normalize(expected) ||
      normalize(toHiragana(reading.trim())) === normalize(expected);
    finish(ok, reading.trim());
  }

  function finish(ok: boolean, userAnswer: string) {
    setStatus(ok ? "correct" : "wrong");
    if (ok) {
      setScore((s) => s + 1);
      const lid = q!.levelId;
      setPerLevelCorrect((m) => ({ ...m, [lid]: (m[lid] ?? 0) + 1 }));
    } else {
      setErrors((e) => [...e, { question: q!, userAnswer }]);
    }
    window.setTimeout(advance, ADVANCE_MS);
  }

  function retry() {
    // Build a fresh exam.
    setSeed((s) => s + 1);
    setIndex(0);
    setScore(0);
    setPerLevelCorrect({});
    setErrors([]);
    setDone(false);
    setSavedSession(false);
  }

  // ─── Empty pool ───
  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
        Seed kanji cards into the regular levels first — the exam draws from them.
      </p>
    );
  }

  // ─── Results screen ───
  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <ResultsScreen
        score={score}
        total={total}
        pct={pct}
        perLevelCorrect={perLevelCorrect}
        perLevelTotal={perLevelTotal}
        levelNames={levelNames}
        errors={errors}
        onRetry={retry}
      />
    );
  }

  if (!q) return null;

  // ─── Active question ───
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          Question {index + 1} / {total}
        </span>
        <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
          Exam
        </span>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 shadow-card">
        {q.kind === "read" ? (
          <ReadQuestionView
            q={q}
            meaning={meaning}
            kun={kun}
            on={on}
            setMeaning={setMeaning}
            setKun={setKun}
            setOn={setOn}
            status={status}
            firstInputRef={firstInputRef}
            onSubmit={submitRead}
          />
        ) : (
          <WordQuestionView
            q={q}
            reading={reading}
            setReading={setReading}
            status={status}
            firstInputRef={firstInputRef}
            onSubmit={submitWord}
          />
        )}

        {status === "correct" && (
          <div className="mt-4 text-center text-sm font-medium text-green-700">
            Correct
          </div>
        )}
        {status === "wrong" && (
          <div className="mt-4 text-center text-sm font-medium text-accent">
            Incorrect
          </div>
        )}
      </div>
    </div>
  );
}

function formatUserReadAnswer({
  meaning,
  kun,
  on,
  hasKun,
  hasOn,
}: {
  meaning: string;
  kun: string;
  on: string;
  hasKun: boolean;
  hasOn: boolean;
}): string {
  const parts: string[] = [];
  parts.push(`meaning: ${meaning.trim() || "—"}`);
  if (hasKun) parts.push(`kun: ${kun.trim() || "—"}`);
  if (hasOn) parts.push(`on: ${on.trim() || "—"}`);
  return parts.join(" · ");
}

// ───────────────────────────────────────────────────────────────────
// Read question (kanji → meaning + kun + on)
// ───────────────────────────────────────────────────────────────────
function ReadQuestionView({
  q,
  meaning,
  kun,
  on,
  setMeaning,
  setKun,
  setOn,
  status,
  firstInputRef,
  onSubmit,
}: {
  q: ReadQuestion;
  meaning: string;
  kun: string;
  on: string;
  setMeaning: (s: string) => void;
  setKun: (s: string) => void;
  setOn: (s: string) => void;
  status: Status;
  firstInputRef: React.RefObject<HTMLInputElement>;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const f = q.card;
  const hasKun = f.kunyomi.length > 0;
  const hasOn = f.onyomi.length > 0;
  return (
    <>
      <div className="mb-6 text-center">
        <div className="jp text-[120px] leading-none">{f.kanji}</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted">
            Meaning (English)
          </label>
          <input
            ref={firstInputRef}
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            disabled={status !== "asking"}
            autoComplete="off"
            spellCheck={false}
            className="input mt-1 text-center text-lg"
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
              disabled={status !== "asking"}
              autoComplete="off"
              spellCheck={false}
              className="input jp mt-1 text-center text-lg"
            />
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
              disabled={status !== "asking"}
              autoComplete="off"
              spellCheck={false}
              className="input jp mt-1 text-center text-lg"
            />
          </div>
        )}
        {status === "asking" && (
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>
        )}
      </form>
    </>
  );
}

// ───────────────────────────────────────────────────────────────────
// Word question (word → reading)
// ───────────────────────────────────────────────────────────────────
function WordQuestionView({
  q,
  reading,
  setReading,
  status,
  firstInputRef,
  onSubmit,
}: {
  q: WordQuestion;
  reading: string;
  setReading: (s: string) => void;
  status: Status;
  firstInputRef: React.RefObject<HTMLInputElement>;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="mb-6 text-center">
        <div className="jp text-6xl leading-none">{q.word.word}</div>
        <div className="mt-3 text-sm text-muted">{q.word.meaning}</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3" autoComplete="off">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted">
            Reading (hiragana or romaji)
          </label>
          <input
            ref={firstInputRef}
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            disabled={status !== "asking"}
            autoComplete="off"
            spellCheck={false}
            className="input jp mt-1 text-center text-2xl"
          />
        </div>
        {status === "asking" && (
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>
        )}
      </form>
    </>
  );
}

// ───────────────────────────────────────────────────────────────────
// Results screen
// ───────────────────────────────────────────────────────────────────
function ResultsScreen({
  score,
  total,
  pct,
  perLevelCorrect,
  perLevelTotal,
  levelNames,
  errors,
  onRetry,
}: {
  score: number;
  total: number;
  pct: number;
  perLevelCorrect: Record<string, number>;
  perLevelTotal: Record<string, number>;
  levelNames: Record<string, string>;
  errors: ErrorItem[];
  onRetry: () => void;
}) {
  const breakdown = Object.entries(perLevelTotal)
    .map(([lid, count]) => ({
      name: levelNames[lid] ?? "Unknown",
      correct: perLevelCorrect[lid] ?? 0,
      total: count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-border bg-white p-8 text-center shadow-card">
        <div className="jp text-5xl">試験終了</div>
        <h2 className="mt-4 text-2xl font-semibold">Exam complete</h2>
        <div className="my-4 text-5xl font-semibold">
          {score} / {total}
        </div>
        <div className="text-lg text-muted">{pct}%</div>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-card">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Breakdown by level
        </h3>
        <ul className="divide-y divide-border">
          {breakdown.map((b) => (
            <li key={b.name} className="flex items-center justify-between py-2">
              <span className="text-sm">{b.name}</span>
              <span className="text-sm font-medium">
                {b.correct} / {b.total}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-border bg-white p-6 shadow-card">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Mistakes ({errors.length})
          </h3>
          <ul className="space-y-4">
            {errors.map((err, i) => {
              const q = err.question;
              return (
                <li
                  key={i}
                  className="rounded-md border border-accent/20 bg-accent/[0.04] p-4"
                >
                  {q.kind === "read" ? (
                    <ReadErrorRow q={q} userAnswer={err.userAnswer} />
                  ) : (
                    <WordErrorRow q={q} userAnswer={err.userAnswer} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button onClick={onRetry} className="btn-primary">
          Retry (new questions)
        </button>
        <a href="../" className="btn-outline">
          Back to levels
        </a>
      </div>
    </div>
  );
}

function ReadErrorRow({
  q,
  userAnswer,
}: {
  q: ReadQuestion;
  userAnswer: string;
}) {
  const f = q.card;
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4 text-sm">
      <div className="jp text-5xl leading-none">{f.kanji}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">
          Your answer
        </div>
        <div className="mb-2">{userAnswer || "—"}</div>
        <div className="text-xs uppercase tracking-wide text-muted">
          Correct
        </div>
        <div>
          <span className="text-muted">Meaning:</span> {f.meanings.join(", ")}
          {f.kunyomi.length > 0 && (
            <>
              {" · "}
              <span className="text-muted">Kun:</span>{" "}
              <span className="jp">{f.kunyomi.join("、")}</span>
            </>
          )}
          {f.onyomi.length > 0 && (
            <>
              {" · "}
              <span className="text-muted">On:</span>{" "}
              <span className="jp">{f.onyomi.join("、")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WordErrorRow({
  q,
  userAnswer,
}: {
  q: WordQuestion;
  userAnswer: string;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4 text-sm">
      <div className="jp text-3xl leading-tight">{q.word.word}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">
          Your answer
        </div>
        <div className="mb-2 jp">{userAnswer || "—"}</div>
        <div className="text-xs uppercase tracking-wide text-muted">
          Correct
        </div>
        <div className="jp">{q.word.reading}</div>
        <div className="mt-1 text-xs text-muted">
          — uses <span className="jp">{q.card.kanji}</span> (
          {q.card.meanings.join(", ")})
        </div>
      </div>
    </div>
  );
}
