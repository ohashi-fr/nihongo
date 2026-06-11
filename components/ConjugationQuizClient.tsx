"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

type Props = {
  cards: Card[];
  levelId: string;
};

type Phase = "intro" | "classify" | "conjugate" | "done";

type FormKey =
  | "affirmative_present"
  | "negative_present"
  | "affirmative_past"
  | "negative_past"
  | "volitional";

const FORM_KEYS: FormKey[] = [
  "affirmative_present",
  "negative_present",
  "affirmative_past",
  "negative_past",
  "volitional",
];

const FORM_LABELS: Record<FormKey, string> = {
  affirmative_present: "Affirmative present",
  negative_present: "Negative present",
  affirmative_past: "Affirmative past",
  negative_past: "Negative past",
  // Internal data key stays "volitional" (existing seeded rows use that key);
  // user-facing label is "Suggestive form".
  volitional: "Suggestive form",
};

const WORD_TYPES: { key: string; jp: string; en: string }[] = [
  { key: "doshi", jp: "動詞", en: "doshi" },
  { key: "suru_meishi", jp: "する動詞", en: "suru meishi" },
  { key: "i_keiyoshi", jp: "い形容詞", en: "i-keiyoshi" },
  { key: "na_keiyoshi", jp: "な形容詞", en: "na-keiyoshi" },
  { key: "meishi", jp: "名詞", en: "meishi" },
];

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

type CardData = {
  word: string;
  word_type: string;
  forms: Record<FormKey, string>;
};

function asCardData(c: Card): CardData {
  const f = c.fields as any;
  return {
    word: f.word ?? "",
    word_type: f.word_type ?? "",
    forms: {
      affirmative_present: f.forms?.affirmative_present ?? "",
      negative_present: f.forms?.negative_present ?? "",
      affirmative_past: f.forms?.affirmative_past ?? "",
      negative_past: f.forms?.negative_past ?? "",
      volitional: f.forms?.volitional ?? "",
    },
  };
}

const blankInputs = (): Record<FormKey, string> => ({
  affirmative_present: "",
  negative_present: "",
  affirmative_past: "",
  negative_past: "",
  volitional: "",
});

export default function ConjugationQuizClient({ cards, levelId }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [includeClassification, setIncludeClassification] = useState(false);

  const [order, setOrder] = useState<Card[]>(() => shuffle(cards));
  const [index, setIndex] = useState(0);

  // Classification state (per card)
  const [classifyPick, setClassifyPick] = useState<string | null>(null);
  const [classifyResult, setClassifyResult] = useState<"correct" | "wrong" | null>(
    null
  );

  // Conjugation state (per card)
  const [inputs, setInputs] = useState<Record<FormKey, string>>(blankInputs());
  const [results, setResults] = useState<Record<FormKey, boolean> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [firstSubmitAllCorrect, setFirstSubmitAllCorrect] = useState<
    boolean | null
  >(null);

  // Score
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [savedSession, setSavedSession] = useState(false);

  const total = order.length;
  const card = order[index] ? asCardData(order[index]) : null;
  const firstInputRef = useRef<HTMLInputElement>(null);

  // All five fields are always shown. For cards where a field has no
  // expected value (e.g. nouns/adjectives have no suggestive form), the
  // expected answer is the empty string — the user is meant to leave that
  // input blank. The validation in checkConjugation handles this naturally.
  const activeFormKeys: FormKey[] = useMemo(
    () => (card ? FORM_KEYS.slice() : []),
    [card]
  );

  // Defensive: whenever we move to a new card, hard-blank every input.
  // This prevents any DOM/state holdover from leaving values pre-filled.
  useEffect(() => {
    setInputs(blankInputs());
    setResults(null);
    setSubmitted(false);
    setFirstSubmitAllCorrect(null);
  }, [index]);

  useEffect(() => {
    if (phase === "conjugate") firstInputRef.current?.focus();
  }, [phase, index]);

  // Save session on done
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
        // silent
      }
    })();
  }, [phase, savedSession, levelId, total, correctFirstTry]);

  function start(includeClassify: boolean) {
    setIncludeClassification(includeClassify);
    setOrder(shuffle(cards));
    setIndex(0);
    resetClassify();
    resetConjugate();
    setCorrectFirstTry(0);
    setPhase(includeClassify ? "classify" : "conjugate");
  }

  function resetClassify() {
    setClassifyPick(null);
    setClassifyResult(null);
  }
  function resetConjugate() {
    setInputs(blankInputs());
    setResults(null);
    setSubmitted(false);
    setFirstSubmitAllCorrect(null);
  }

  function pickType(key: string) {
    if (!card || classifyResult !== null) return;
    setClassifyPick(key);
    setClassifyResult(key === card.word_type ? "correct" : "wrong");
  }

  function continueToConjugate() {
    setPhase("conjugate");
  }

  function checkConjugation(e: React.FormEvent) {
    e.preventDefault();
    if (!card) return;
    const r: Record<FormKey, boolean> = {
      affirmative_present: false,
      negative_present: false,
      affirmative_past: false,
      negative_past: false,
      volitional: false,
    };
    let allCorrect = true;
    // Only validate the keys this card actually has.
    for (const k of activeFormKeys) {
      const ok = normalize(inputs[k]) === normalize(card.forms[k]);
      r[k] = ok;
      if (!ok) allCorrect = false;
    }
    setResults(r);
    if (!submitted) {
      setSubmitted(true);
      setFirstSubmitAllCorrect(allCorrect);
      if (allCorrect) {
        setCorrectFirstTry((n) => n + 1);
        window.setTimeout(advance, 1200);
      }
    } else {
      // Resubmissions: just update feedback; don't change score.
      if (allCorrect) {
        window.setTimeout(advance, 800);
      }
    }
  }

  function advance() {
    resetClassify();
    resetConjugate();
    if (index + 1 >= total) {
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
      setPhase(includeClassification ? "classify" : "conjugate");
    }
  }

  function reset() {
    setOrder(shuffle(cards));
    setIndex(0);
    resetClassify();
    resetConjugate();
    setCorrectFirstTry(0);
    setSavedSession(false);
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 shadow-card">
        <div className="text-center">
          <div className="jp text-4xl">単語の種類</div>
          <h2 className="mt-3 text-xl font-semibold">
            Practice identifying word types?
          </h2>
          <p className="mt-2 text-sm text-muted">
            Before each conjugation card, you&apos;ll classify the word as
            verb / suru-verb / i-adjective / na-adjective / noun.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => start(true)}
            className="btn-primary"
          >
            Yes, include it
          </button>
          <button
            onClick={() => start(false)}
            className="btn-outline"
          >
            No, skip classification
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const pct = total === 0 ? 0 : Math.round((correctFirstTry / total) * 100);
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-card">
        <div className="jp text-5xl">お疲れ様</div>
        <h2 className="mt-4 text-2xl font-semibold">Done!</h2>
        <p className="mt-2 text-muted">
          {correctFirstTry} / {total} cards perfect on first try
        </p>
        <div className="my-6 text-4xl font-semibold">{pct}%</div>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Restart
          </button>
          <Link href="/modules/conjugation" className="btn-outline">
            Back to levels
          </Link>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} / {total}
          {includeClassification && (
            <span className="ml-2">
              · {phase === "classify" ? "classify" : "conjugate"}
            </span>
          )}
        </span>
        <button
          onClick={reset}
          className="hover:text-ink underline-offset-2 hover:underline"
        >
          Reshuffle
        </button>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted">
            Word
          </div>
          <div className="jp mt-2 text-4xl">{card.word}</div>
        </div>

        {phase === "classify" ? (
          <ClassifySection
            card={card}
            pick={classifyPick}
            result={classifyResult}
            onPick={pickType}
            onContinue={continueToConjugate}
          />
        ) : (
          <ConjugateSection
            key={`conjugate-${index}`}
            card={card}
            activeFormKeys={activeFormKeys}
            inputs={inputs}
            results={results}
            submitted={submitted}
            firstSubmitAllCorrect={firstSubmitAllCorrect}
            firstInputRef={firstInputRef}
            onChange={(k, v) => setInputs({ ...inputs, [k]: v })}
            onCheck={checkConjugation}
            onSkip={advance}
          />
        )}
      </div>
    </div>
  );
}

function ClassifySection({
  card,
  pick,
  result,
  onPick,
  onContinue,
}: {
  card: CardData;
  pick: string | null;
  result: "correct" | "wrong" | null;
  onPick: (key: string) => void;
  onContinue: () => void;
}) {
  const correctType = WORD_TYPES.find((w) => w.key === card.word_type);
  return (
    <div>
      <div className="mb-3 text-center text-sm text-muted">
        What type of word is this?
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {WORD_TYPES.map((wt) => {
          const isPick = pick === wt.key;
          const isCorrect = wt.key === card.word_type;
          let cls = "btn-outline justify-between";
          if (result !== null) {
            if (isCorrect) cls = "btn justify-between border border-green-600 bg-green-50 text-green-800";
            else if (isPick) cls = "btn justify-between border border-accent bg-accent/5 text-accent";
            else cls = "btn-outline justify-between opacity-60";
          }
          return (
            <button
              key={wt.key}
              onClick={() => onPick(wt.key)}
              disabled={result !== null}
              className={cls}
            >
              <span className="jp">{wt.jp}</span>
              <span className="text-xs text-muted">{wt.en}</span>
            </button>
          );
        })}
      </div>

      {result === "correct" && (
        <div className="mt-5 text-center">
          <div className="text-green-700">正解！ Correct.</div>
          <button onClick={onContinue} className="btn-primary mt-3">
            Continue → conjugation
          </button>
        </div>
      )}
      {result === "wrong" && (
        <div className="mt-5 rounded-md border border-accent/30 bg-accent/5 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-accent">
            Not quite
          </div>
          <div className="mt-1 text-sm">
            It&apos;s{" "}
            <span className="jp font-medium">
              {correctType?.jp ?? card.word_type}
            </span>{" "}
            <span className="text-muted">
              ({correctType?.en ?? card.word_type})
            </span>
            .
          </div>
          <button onClick={onContinue} className="btn-primary mt-3">
            Continue → conjugation
          </button>
        </div>
      )}
    </div>
  );
}

function ConjugateSection({
  card,
  activeFormKeys,
  inputs,
  results,
  submitted,
  firstSubmitAllCorrect,
  firstInputRef,
  onChange,
  onCheck,
  onSkip,
}: {
  card: CardData;
  activeFormKeys: FormKey[];
  inputs: Record<FormKey, string>;
  results: Record<FormKey, boolean> | null;
  submitted: boolean;
  firstSubmitAllCorrect: boolean | null;
  firstInputRef: React.RefObject<HTMLInputElement>;
  onChange: (k: FormKey, v: string) => void;
  onCheck: (e: React.FormEvent) => void;
  onSkip: () => void;
}) {
  const total = activeFormKeys.length;
  const correctCount = activeFormKeys.filter(
    (k) => results?.[k] === true
  ).length;
  return (
    <form onSubmit={onCheck} className="space-y-3" autoComplete="off">
      {activeFormKeys.map((k, i) => {
        const ok = results?.[k];
        const showWrong = results !== null && ok === false;
        const showRight = results !== null && ok === true;
        const expectedBlank = !card.forms[k];
        const isSuggestive = k === "volitional";
        return (
          <div
            key={k}
            className="grid grid-cols-[160px_1fr] items-start gap-3"
          >
            <label className="pt-2 text-right text-xs font-medium uppercase tracking-wide">
              {FORM_LABELS[k]}
            </label>
            <div>
              <input
                ref={i === 0 ? firstInputRef : undefined}
                value={inputs[k]}
                onChange={(e) => onChange(k, e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className={`input jp text-lg ${
                  showWrong ? "border-accent ring-2 ring-accent/20" : ""
                } ${showRight ? "border-green-600 ring-2 ring-green-600/20" : ""}`}
              />
              {isSuggestive && (
                <div className="mt-1 text-xs text-muted">
                  (Leave blank if none)
                </div>
              )}
              {showWrong && (
                <div className="mt-1 text-sm">
                  <span className="text-muted">Answer: </span>
                  {expectedBlank ? (
                    <span className="text-accent">— (leave blank)</span>
                  ) : (
                    <span className="jp text-accent">{card.forms[k]}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {results === null && (
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onSkip} className="btn-ghost">
            Skip
          </button>
          <button type="submit" className="btn-primary">
            Check all
          </button>
        </div>
      )}

      {results !== null && firstSubmitAllCorrect && (
        <div className="text-center text-green-700">
          All {total} correct! 🌸
        </div>
      )}

      {results !== null && !firstSubmitAllCorrect && (
        <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
          <div className="text-center text-sm">
            {correctCount} / {total} correct.{" "}
            {submitted && (
              <span className="text-muted">
                Adjust the wrong fields and check again, or move on.
              </span>
            )}
          </div>
          <div className="mt-3 flex justify-center gap-3">
            <button type="submit" className="btn-outline">
              Check again
            </button>
            <button type="button" onClick={onSkip} className="btn-primary">
              Next
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
