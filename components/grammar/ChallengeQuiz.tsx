"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChallengeExam, ChallengeQuestion, ChallengeSection } from "@/content/grammar/challenge-quiz";
import { getNotionBySlugL4L5 } from "@/content/grammar/grammar-l4l5";
import {
  QuestionCard,
  blankWidthCh,
  isBlankCorrect,
  isChoiceCorrect,
  shuffle,
  splitPrompt,
} from "./ExamQuiz";
import { Pill, ResultsActions, ResultsSummary, ReviewNotionLink } from "./QuizShared";

// This renderer is a sibling of ExamQuiz, not a reuse of it: the giant
// quiz mixes fill_blank and multiple_choice *within* one section (the
// type lives on each question), whereas ExamQuiz's two data shapes both
// fix one type per section. The grading/formatting primitives (kana
// matching, blank sizing, question card chrome) are still shared via
// import rather than duplicated.

type Phase = "setup" | "section" | "final";

type SectionStat = {
  section_id: string;
  title: string;
  correct: number;
  total: number;
};

function GrammarRefFooter({ courseRef, notionSlug }: { courseRef: string; notionSlug: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted">{courseRef}</span>
      <ReviewNotionLink notionSlug={notionSlug} resolver={getNotionBySlugL4L5} />
    </div>
  );
}

function FillBlankRow({
  question,
  values,
  onChange,
  submitted,
  blankResults,
}: {
  question: ChallengeQuestion;
  values: string[];
  onChange: (blankIndex: number, value: string) => void;
  submitted: boolean;
  blankResults?: boolean[];
}) {
  const parts = splitPrompt(question.prompt);
  const blankCount = question.answers.length;
  const allCorrect = submitted && !!blankResults && blankResults.every(Boolean);

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
          style={{ width: `${blankWidthCh(question.answers[i], values[i] ?? "")}ch` }}
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
      hint={question.base_word}
      submitted={submitted}
      allCorrect={allCorrect}
      wrongFooter={
        <>
          <ul className="space-y-1">
            {question.answers.map((variants, i) =>
              blankResults && blankResults[i] ? null : (
                <li key={i} className="jp text-sm text-sumi">
                  {blankCount > 1 && <span className="text-muted">Blank {i + 1}: </span>}
                  <span className="font-semibold">{variants.join(" / ")}</span>
                </li>
              )
            )}
          </ul>
          <GrammarRefFooter courseRef={question.courseRef} notionSlug={question.notionSlug} />
        </>
      }
    >
      <div className="jp flex flex-wrap items-center gap-x-1 gap-y-2 text-base leading-loose text-ink">
        {nodes}
      </div>
    </QuestionCard>
  );
}

function ChoiceRow({
  question,
  value,
  onChange,
  submitted,
  correct,
}: {
  question: ChallengeQuestion;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  const opts = question.options ?? [];
  const parts = splitPrompt(question.prompt);
  const variants = question.answers[0] ?? [];
  const allCorrect = submitted && !!correct;

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
          <GrammarRefFooter courseRef={question.courseRef} notionSlug={question.notionSlug} />
        </>
      }
    >
      <p className="jp text-base leading-loose text-ink">
        {parts[0]}
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
        {parts[1]}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {opts.map((opt) => {
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
              {opt}
            </button>
          );
        })}
      </div>
    </QuestionCard>
  );
}

type Props = {
  quiz: ChallengeExam;
  onExit: () => void;
  scrollToTop: () => void;
};

export default function ChallengeQuiz({ quiz, onExit, scrollToTop }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [startSectionId, setStartSectionId] = useState<string>(quiz.sections[0].id);
  const [sectionOrder, setSectionOrder] = useState<ChallengeSection[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [inputs, setInputs] = useState<Record<number, string[]>>({});
  const [results, setResults] = useState<Record<number, boolean[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sectionScores, setSectionScores] = useState<SectionStat[]>([]);
  const [savedSession, setSavedSession] = useState(false);

  const totalQuestions = useMemo(
    () => quiz.sections.reduce((n, sec) => n + sec.questions.length, 0),
    [quiz]
  );

  const section = sectionOrder[sectionIndex];

  function resetSectionState(sec: ChallengeSection) {
    const initial: Record<number, string[]> = {};
    for (const q of sec.questions) initial[q.id] = new Array(q.answers.length).fill("");
    setInputs(initial);
    setResults({});
    setSubmitted(false);
  }

  function startQuiz(fromSectionId: string) {
    const startIdx = quiz.sections.findIndex((s) => s.id === fromSectionId);
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

  function submitSection() {
    if (!section || submitted) return;
    const newResults: Record<number, boolean[]> = {};
    let correct = 0;
    let total = 0;
    for (const q of section.questions) {
      const check = q.type === "multiple_choice" ? isChoiceCorrect : isBlankCorrect;
      const blankResults = q.answers.map((variants, i) => check(inputs[q.id]?.[i] ?? "", variants));
      newResults[q.id] = blankResults;
      correct += blankResults.filter(Boolean).length;
      total += blankResults.length;
    }
    setResults(newResults);
    setSubmitted(true);
    setSectionScores((prev) => [...prev, { section_id: section.id, title: section.title, correct, total }]);
    scrollToTop();
  }

  function nextSection() {
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

  const overallCorrect = sectionScores.reduce((n, s) => n + s.correct, 0);
  const overallTotal = sectionScores.reduce((n, s) => n + s.total, 0);

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
                d="M13 2L4.5 13.5H11L10 22L19.5 10H13L13 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="jp mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
            {quiz.title}
          </h2>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Challenge quiz</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{quiz.description}</p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Start with
          </p>
          <div className="flex flex-wrap gap-2">
            {quiz.sections.map((sec, i) => (
              <Pill
                key={sec.id}
                label={`Section ${i + 1} · ${sec.title}`}
                selected={startSectionId === sec.id}
                onClick={() => setStartSectionId(sec.id)}
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
                    {s.correct}/{s.total} correct
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

  // ─── SECTION (fill, then check as a whole) ────────────────────────
  if (!section) return null;

  const sectionTotal = section.questions.reduce((n, q) => n + q.answers.length, 0);
  const sectionCorrect = submitted
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
          Section {sectionIndex + 1}
        </div>
        <h2 className="text-xl font-bold text-ink">{section.title}</h2>
      </div>

      {submitted && (
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
        {section.questions.map((q) =>
          q.type === "multiple_choice" ? (
            <ChoiceRow
              key={q.id}
              question={q}
              value={inputs[q.id]?.[0] ?? ""}
              onChange={(v) => updateInput(q.id, 0, v)}
              submitted={submitted}
              correct={results[q.id] ? results[q.id][0] : null}
            />
          ) : (
            <FillBlankRow
              key={q.id}
              question={q}
              values={inputs[q.id] ?? []}
              onChange={(i, v) => updateInput(q.id, i, v)}
              submitted={submitted}
              blankResults={results[q.id]}
            />
          )
        )}
      </div>

      <div className="mt-6 flex justify-center">
        {!submitted ? (
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
