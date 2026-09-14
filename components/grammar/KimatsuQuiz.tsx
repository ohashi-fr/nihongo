"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  KimatsuQuestion,
  KimatsuQuiz as KimatsuQuizData,
  KimatsuSection,
} from "@/content/grammar/kimatsu-quiz";
import {
  QuestionCard,
  blankWidthCh,
  isBlankCorrect,
  isChoiceCorrect,
  normalize,
  shuffle,
  splitPrompt,
} from "./ExamQuiz";
import { Pill, ResultsActions, ResultsSummary } from "./QuizShared";

// A sibling of ExamQuiz/ChallengeQuiz, not a reuse of either: this data set
// mixes six question types (fill_blank/multiple_choice/true_false/ordering
// are auto-graded; production/open are self-reviewed, autoGraded:false at
// the section level) and spans L1–L6, unlike the other L4–L5 quizzes. The
// grading/formatting primitives are still shared via import.

type Phase = "setup" | "section" | "final";

type SectionStat = {
  section_id: string;
  title: string;
  correct: number;
  total: number;
  graded: boolean;
};

/** ordering answers are single katakana letters (ア–カ), not vocabulary —
 * compared as-is (no romaji/hiragana conversion, which would mangle them). */
function isLetterCorrect(userInput: string, variants: string[]): boolean {
  const raw = normalize(userInput);
  if (!raw) return false;
  return variants.some((v) => normalize(v) === raw);
}

function displayPrompt(question: KimatsuQuestion): string {
  return question.prompt_hiragana ?? question.prompt;
}

const SECTION_LABELS: Record<string, string> = {
  問題1: "Particles",
  問題2: "Verb forms",
  問題3: "Adjectives & nouns",
  問題4: "Choose the correct form",
  問題6: "Reading comprehension",
  問題7: "Answer the questions",
  会話練習: "Speaking practice",
  会話14: "Memorise & perform",
};

function NoteLine({ note }: { note?: string }) {
  if (!note) return null;
  return <p className="mt-2 text-xs italic text-muted">{note}</p>;
}

function RefFooter({ courseRef }: { courseRef?: string }) {
  if (!courseRef) return null;
  return <div className="mt-2 text-xs text-muted">{courseRef}</div>;
}

/** fill_blank and ordering both type into inline blanks inside the prompt —
 * they only differ in which correctness function graded them (decided by
 * the caller in submitSection), so one row renders both. */
function FillBlankRow({
  question,
  values,
  onChange,
  submitted,
  blankResults,
}: {
  question: KimatsuQuestion;
  values: string[];
  onChange: (blankIndex: number, value: string) => void;
  submitted: boolean;
  blankResults?: boolean[];
}) {
  const parts = splitPrompt(displayPrompt(question));
  const answers = question.answers ?? [];
  const blankCount = answers.length;
  const allCorrect = submitted && !!blankResults && blankResults.every(Boolean);
  const hint = question.base_word_hiragana ?? question.base_word;

  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) {
      nodes.push(
        <span key={`t-${i}`} className="jp">
          {part}
        </span>
      );
    }
    if (i < blankCount) {
      const isCorrect = blankResults ? blankResults[i] : null;
      nodes.push(
        <input
          key={`i-${i}`}
          value={values[i] ?? ""}
          onChange={(e) => onChange(i, e.target.value)}
          onFocus={(e) => e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })}
          disabled={submitted}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="…"
          style={{ width: `${blankWidthCh(answers[i], values[i] ?? "")}ch` }}
          className={`jp inline-block rounded-lg border-2 px-2 py-1 text-center align-baseline text-base outline-none transition-[width,border-color,box-shadow] duration-150 ${
            !submitted
              ? "border-border bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
              : isCorrect
                ? "border-success bg-success-50 text-success-700"
                : "border-red-400 bg-red-50 text-red-700"
          }`}
        />
      );
    }
  });

  return (
    <QuestionCard
      id={question.id}
      hint={hint}
      submitted={submitted}
      allCorrect={allCorrect}
      wrongFooter={
        <>
          <ul className="space-y-1">
            {answers.map((variants, i) =>
              blankResults && blankResults[i] ? null : (
                <li key={i} className="jp text-sm text-sumi">
                  {blankCount > 1 && <span className="text-muted">Blank {i + 1}: </span>}
                  <span className="font-semibold">{variants.join(" / ")}</span>
                </li>
              )
            )}
          </ul>
          <RefFooter courseRef={question.courseRef} />
        </>
      }
    >
      <div className="jp flex flex-wrap items-center gap-x-1 gap-y-2 text-base leading-loose text-ink">
        {nodes}
      </div>
      <NoteLine note={question.note} />
    </QuestionCard>
  );
}

/** multiple_choice and true_false both pick one of `options` — true_false's
 * prompt is a full statement (no （　） blank), so the inline answer chip
 * is skipped for it. */
function ChoiceRow({
  question,
  value,
  onChange,
  submitted,
  correct,
}: {
  question: KimatsuQuestion;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  const opts = question.options ?? [];
  const optsHiragana = question.options_hiragana;
  const parts = splitPrompt(displayPrompt(question));
  const variants = question.answers?.[0] ?? [];
  const allCorrect = submitted && !!correct;
  const isTrueFalse = question.type === "true_false";

  return (
    <QuestionCard
      id={question.id}
      submitted={submitted}
      allCorrect={allCorrect}
      wrongFooter={
        <>
          <p className="jp text-sm text-sumi">
            <span className="font-semibold">{variants.join(" / ")}</span>
          </p>
          <RefFooter courseRef={question.courseRef} />
        </>
      }
    >
      <p className="jp text-base leading-loose text-ink">
        {parts[0]}
        {!isTrueFalse && (
          <span
            className={`mx-1 inline-block min-w-[3ch] rounded-lg border-2 px-2 py-0.5 text-center align-baseline text-base ${
              !submitted
                ? "border-dashed border-primary-200 text-muted"
                : correct
                  ? "border-success bg-success-50 text-success-700"
                  : "border-red-400 bg-red-50 text-red-700"
            }`}
          >
            {value || "？"}
          </span>
        )}
        {parts[1]}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {opts.map((opt, i) => {
          const label = optsHiragana?.[i] ?? opt;
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={submitted}
              onClick={() => onChange(opt)}
              className={`jp rounded-full px-3.5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? submitted
                    ? correct
                      ? "bg-success text-white"
                      : "bg-red-400 text-white"
                    : "bg-primary text-white shadow-soft"
                  : "bg-soft text-sumi hover:bg-primary-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <NoteLine note={question.note} />
    </QuestionCard>
  );
}

/** production/open questions live in autoGraded:false sections — no single
 * correct answer, so this just shows the prompt/scene/gloss and, when a
 * model answer exists, a reveal toggle instead of a checked input. */
function OpenRow({
  question,
  revealed,
  onToggleReveal,
}: {
  question: KimatsuQuestion;
  revealed: boolean;
  onToggleReveal: () => void;
}) {
  const hasModel = !!(question.modelAnswer || question.modelAnswer_hiragana);
  return (
    <QuestionCard id={question.id} scene={question.scene} submitted allCorrect>
      <p className="jp text-base leading-loose text-ink">{question.prompt}</p>
      {question.gloss && <p className="mt-1 text-sm text-muted">{question.gloss}</p>}
      {hasModel ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={onToggleReveal}
            className="text-sm font-semibold text-primary transition hover:text-primary-700"
          >
            {revealed ? "Hide model answer" : "Show model answer →"}
          </button>
          {revealed && (
            <div className="mt-2 rounded-xl bg-success-50 p-3">
              <p className="jp text-sm text-success-700">
                {question.modelAnswer_hiragana ?? question.modelAnswer}
              </p>
              <NoteLine note={question.note} />
            </div>
          )}
        </div>
      ) : (
        <NoteLine note={question.note} />
      )}
      <RefFooter courseRef={question.courseRef} />
    </QuestionCard>
  );
}

type Props = {
  quiz: KimatsuQuizData;
  onExit: () => void;
  scrollToTop: () => void;
};

export default function KimatsuQuiz({ quiz, onExit, scrollToTop }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [startSectionId, setStartSectionId] = useState<string>(quiz.sections[0].section_id);
  const [sectionOrder, setSectionOrder] = useState<KimatsuSection[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [inputs, setInputs] = useState<Record<number, string[]>>({});
  const [results, setResults] = useState<Record<number, boolean[]>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sectionScores, setSectionScores] = useState<SectionStat[]>([]);
  const [savedSession, setSavedSession] = useState(false);

  const totalQuestions = useMemo(
    () => quiz.sections.reduce((n, sec) => n + sec.questions.length, 0),
    [quiz]
  );

  const section = sectionOrder[sectionIndex];

  function resetSectionState(sec: KimatsuSection) {
    const initial: Record<number, string[]> = {};
    for (const q of sec.questions) initial[q.id] = new Array(q.answers?.length ?? 1).fill("");
    setInputs(initial);
    setResults({});
    setRevealed({});
    setSubmitted(!sec.autoGraded);
  }

  function startQuiz(fromSectionId: string) {
    const startIdx = quiz.sections.findIndex((s) => s.section_id === fromSectionId);
    const rotated = [...quiz.sections.slice(startIdx), ...quiz.sections.slice(0, startIdx)];
    const order = rotated.map((sec) => ({ ...sec, questions: shuffle(sec.questions) }));
    setSectionOrder(order);
    setSectionIndex(0);
    resetSectionState(order[0]);
    setSectionScores([]);
    setSavedSession(false);
    setPhase("section");
    scrollToTop();
  }

  function updateInput(questionId: number, blankIndex: number, value: string) {
    setInputs((prev) => {
      const next = { ...prev, [questionId]: (prev[questionId] ?? []).slice() };
      next[questionId][blankIndex] = value;
      return next;
    });
  }

  function toggleReveal(questionId: number) {
    setRevealed((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }

  function submitSection() {
    if (!section || submitted || !section.autoGraded) return;
    const newResults: Record<number, boolean[]> = {};
    let correct = 0;
    let total = 0;
    for (const q of section.questions) {
      const answers = q.answers ?? [];
      const check =
        q.type === "multiple_choice" || q.type === "true_false"
          ? isChoiceCorrect
          : q.type === "ordering"
            ? isLetterCorrect
            : isBlankCorrect;
      const blankResults = answers.map((variants, i) => check(inputs[q.id]?.[i] ?? "", variants));
      newResults[q.id] = blankResults;
      correct += blankResults.filter(Boolean).length;
      total += blankResults.length;
    }
    setResults(newResults);
    setSubmitted(true);
    setSectionScores((prev) => [
      ...prev,
      { section_id: section.section_id, title: section.title, correct, total, graded: true },
    ]);
    scrollToTop();
  }

  function nextSection() {
    if (section && !section.autoGraded) {
      setSectionScores((prev) => [
        ...prev,
        { section_id: section.section_id, title: section.title, correct: 0, total: 0, graded: false },
      ]);
    }
    const nextIdx = sectionIndex + 1;
    if (nextIdx >= sectionOrder.length) {
      setPhase("final");
      scrollToTop();
    } else {
      setSectionIndex(nextIdx);
      resetSectionState(sectionOrder[nextIdx]);
      scrollToTop();
    }
  }

  function retryQuiz() {
    startQuiz(startSectionId);
  }

  function backToSetup() {
    setPhase("setup");
    scrollToTop();
  }

  const gradedScores = sectionScores.filter((s) => s.graded);
  const overallCorrect = gradedScores.reduce((n, s) => n + s.correct, 0);
  const overallTotal = gradedScores.reduce((n, s) => n + s.total, 0);

  // Save once the whole quiz is done, same pattern as the other quizzes.
  useEffect(() => {
    if (phase !== "final" || savedSession || overallTotal === 0) return;
    (async () => {
      try {
        const supabase = createClient();
        await supabase.from("sessions").insert({
          level_id: null,
          total_cards: overallTotal,
          correct_first_try: overallCorrect,
        });
        setSavedSession(true);
      } catch {
        // Don't block the UI on a failed save.
      }
    })();
  }, [phase, savedSession, overallTotal, overallCorrect]);

  // ─── SETUP ──────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-accent-700" aria-hidden>
              <path
                d="M4 19.5V6a2 2 0 012-2h9l5 5v10.5a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9 13h6M9 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="jp mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
            {quiz.title}
          </h2>
          <h2 className="text-2xl font-bold tracking-tight text-ink">End-of-term review</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{quiz.description}</p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Start with
          </p>
          <div className="flex flex-wrap gap-2">
            {quiz.sections.map((sec, i) => (
              <Pill
                key={sec.section_id}
                label={`${i + 1} · ${SECTION_LABELS[sec.section_id] ?? sec.title}`}
                selected={startSectionId === sec.section_id}
                onClick={() => setStartSectionId(sec.section_id)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => startQuiz(startSectionId)}
          className="btn-accent mt-8 w-full justify-center !rounded-2xl !py-3 text-base"
        >
          Start → ({totalQuestions} questions · {quiz.sections.length} sections)
        </button>
      </div>
    );
  }

  // ─── FINAL RESULTS ──────────────────────────────────────────────────
  if (phase === "final") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <ResultsSummary correct={overallCorrect} total={overallTotal} unitLabel="correct" />

        {sectionScores.length > 0 && (
          <div className="mb-8 text-left">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              By section
            </p>
            <ul className="space-y-2">
              {sectionScores.map((s) => (
                <li
                  key={s.section_id}
                  className="jp flex items-center justify-between gap-3 rounded-xl bg-soft px-4 py-3"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-ink">{s.title}</span>
                  <span className="shrink-0 text-xs font-normal text-muted">
                    {s.graded ? `${s.correct}/${s.total} correct` : "Self-reviewed"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ResultsActions
          onRetry={retryQuiz}
          onChangeScope={backToSetup}
          onExit={onExit}
          changeScopeLabel="Change starting section"
          retryLabel="Retry from the start"
        />
      </div>
    );
  }

  // ─── SECTION ────────────────────────────────────────────────────────
  if (!section) return null;

  const sectionTotal = section.questions.reduce((n, q) => n + (q.answers?.length ?? 0), 0);
  const sectionCorrect =
    submitted && section.autoGraded
      ? Object.values(results).reduce((n, r) => n + r.filter(Boolean).length, 0)
      : 0;
  const isLastSection = sectionIndex === sectionOrder.length - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between text-sm text-muted">
        <span>
          Section {sectionIndex + 1} / {sectionOrder.length}
        </span>
        <button onClick={onExit} className="text-sm font-medium text-muted transition hover:text-primary">
          Exit quiz
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-soft p-4">
        <div className="jp text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
          {section.section_id}
        </div>
        <h2 className="text-xl font-bold text-ink">{section.title}</h2>
        <p className="mt-2 text-sm text-sumi">{section.instructions}</p>
        {section.passage && (
          <div className="jp mt-3 rounded-xl bg-white p-3.5 text-sm leading-relaxed text-ink">
            {section.passage_hiragana ?? section.passage}
          </div>
        )}
      </div>

      {submitted && section.autoGraded && (
        <div className="mb-6 rounded-2xl bg-primary-50 p-4 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
            Section score
          </div>
          <div className="mt-1 text-3xl font-bold text-primary">
            {sectionCorrect} / {sectionTotal}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {section.questions.map((q) => {
          if (q.type === "fill_blank" || q.type === "ordering") {
            return (
              <FillBlankRow
                key={q.id}
                question={q}
                values={inputs[q.id] ?? []}
                onChange={(i, v) => updateInput(q.id, i, v)}
                submitted={submitted}
                blankResults={results[q.id]}
              />
            );
          }
          if (q.type === "multiple_choice" || q.type === "true_false") {
            return (
              <ChoiceRow
                key={q.id}
                question={q}
                value={inputs[q.id]?.[0] ?? ""}
                onChange={(v) => updateInput(q.id, 0, v)}
                submitted={submitted}
                correct={results[q.id] ? results[q.id][0] : null}
              />
            );
          }
          return (
            <OpenRow
              key={q.id}
              question={q}
              revealed={!!revealed[q.id]}
              onToggleReveal={() => toggleReveal(q.id)}
            />
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        {section.autoGraded && !submitted ? (
          <button type="button" onClick={submitSection} className="btn-primary">
            Submit section
          </button>
        ) : (
          <button type="button" onClick={nextSection} className="btn-accent !rounded-2xl !py-3 sm:px-10">
            {isLastSection ? "See final results →" : "Next section →"}
          </button>
        )}
      </div>
    </div>
  );
}
