"use client";

import { useEffect, useMemo, useState } from "react";
import { toHiragana } from "wanakana";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamExample, ExamQuestion, ExamSection } from "@/content/grammar/exam-quiz";
import {
  Pill,
  ResultsActions,
  ResultsSummary,
  ReviewNotionLink,
} from "./QuizShared";

type Phase = "setup" | "section" | "final";

type SectionStat = {
  section_id: string;
  title: string;
  correct: number;
  total: number;
};

const BLANK_MARKER = "（　）";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The setup screen's "Start with" picker needs to be readable to a
// beginner who can't parse 助詞/動詞/形容詞 — the section itself still
// runs entirely in Japanese, only this navigational label is English.
const SECTION_ENGLISH_LABEL: Record<string, string> = {
  問題1: "Particles",
  問題2: "Verbs",
  問題3: "Adjectives & nouns",
};

function normalize(s: string): string {
  return (s ?? "").trim().normalize("NFC");
}

const KANJI_RE = /[一-鿿]/;

/** Answers arrays mix kanji + kana spellings; input is hiragana, so only
 * the kana-only variant(s) are valid matches. Falls back to all variants
 * if none are kana-only (shouldn't happen with this data set). */
function getKanaVariants(variants: string[]): string[] {
  const kanaOnly = variants.filter((v) => !KANJI_RE.test(v));
  return kanaOnly.length > 0 ? kanaOnly : variants;
}

function isBlankCorrect(userInput: string, variants: string[]): boolean {
  const raw = normalize(userInput);
  if (!raw) return false;
  const accepted = new Set(getKanaVariants(variants).map(normalize));
  // Accept the raw input as typed (kana via IME) or, for convenience,
  // romaji converted to hiragana — comparison always happens in kana.
  return accepted.has(raw) || accepted.has(normalize(toHiragana(raw)));
}

function splitPrompt(prompt: string): string[] {
  return prompt.split(BLANK_MARKER);
}

// Sizes each blank's input to roughly fit its expected answer instead of
// using one fixed width for both a single ぶ particle and a 10-character
// adjective chain. Also grows live with whatever the user has typed so
// far — typed romaji (e.g. "tabemasu") runs longer than the kana it
// converts to ("たべます"), and the field shouldn't clip it while typing.
function blankWidthCh(variants: string[], currentValue: string): number {
  const maxLen = Math.max(...getKanaVariants(variants).map((v) => v.length), 1);
  const typedLen = currentValue.length;
  return Math.min(24, Math.max(4, maxLen + 2, typedLen + 2));
}

/**
 * Course grammar-point codes (e.g. "L2-3文17") don't map 1:1 onto the
 * 26 grammar-data.ts notions — most exam questions drill basic verb/
 * adjective conjugation that isn't its own notion there. This table
 * only covers codes where the exam question tests exactly the rule a
 * notion teaches (verified by reading each question against the
 * matching notion's content); everything else is intentionally left
 * unmapped and the reference code is shown as plain text.
 */
const REFERENCE_TO_NOTION: Record<string, string> = {
  "L1-1": "ability", // 北海道へ行ったことがありません — たことがある
  "L1-2文4": "to-omou", // ～と思います
  "L1-3文5": "kara-node", // から
  "L1-3文6": "kara-node", // ので
  "L1-4文7": "toki", // とき (adjective/noun lesson)
  "L1-4文8": "toki", // とき (verb lesson)
  "L1-5文9": "verb-types", // みえます・きこえます が vs action verb を
  "L2-1文12": "linking-adjectives", // くて／で
  "L2-2文13": "same-different", // おなじ
  "L2-2文14": "permission", // ～てもいいですか
  "L2-2表現": "same-different", // ...は...が同じです
  "L2-3文16": "particles-place", // に・で・を (enter/act-within/leave)
  "L2-3文17": "going-to-do", // stem + に行きます
  "L2-4文18": "describe-noun", // relative clause modifying a noun
  "L2-4文19": "ability", // ことができる
  "L2-5文21": "nimo-niwa", // にも／には
  "L2-6文22": "particles-place", // 空を飛ぶ — space traversed
  "L2-7文24": "comparison", // AとBとどちらのほうが
  "L2-7文25": "comparison", // ～のなかで一番
  "L2-7文26": "comparison", // ～ほどじゃありません context
  "L3-1文29": "te-naide", // て-form sequential action
  "L3-1文30": "te-naide", // ないで
  "L3-2文31": "naru-suru", // なる／ようになる
  "L3-3文32": "adjective-adverb", // い-adj → く
  "L3-4文34": "sou-seeming", // ～そう (appearance)
  "L3-4文35": "sou-seeming", // ～そうな + noun
};

function ExampleBlock({ example }: { example: ExamExample }) {
  const parts = splitPrompt(example.prompt_hiragana);
  const hint = example.base_word_hiragana ?? example.base_word;
  return (
    <div className="mt-3 rounded-xl bg-white p-3.5">
      {hint && <div className="jp mb-1.5 text-xs font-medium text-muted">→ from {hint}</div>}
      <p className="jp text-base leading-relaxed text-ink">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="font-bold text-success-700">
                {example.answers[i]?.[0] ?? ""}
              </span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}

/** One question's fill-in row inside a section. Rendered for every
 * question in the section at once — there's no per-question navigation
 * anymore, the whole section is filled and checked together. */
function QuestionRow({
  question,
  values,
  onChange,
  submitted,
  blankResults,
}: {
  question: ExamQuestion;
  values: string[];
  onChange: (blankIndex: number, value: string) => void;
  submitted: boolean;
  blankResults?: boolean[];
}) {
  const parts = splitPrompt(question.prompt_hiragana);
  const blankCount = question.answers.length;
  const allCorrect = submitted && !!blankResults && blankResults.every(Boolean);
  const notionSlug = REFERENCE_TO_NOTION[question.grammar_reference];
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
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[11px] font-bold text-primary">
          {question.id}
        </span>
        <div className="min-w-0 flex-1">
          {hint && <div className="jp mb-1 text-xs font-medium text-muted">→ from {hint}</div>}
          <div className="jp flex flex-wrap items-center gap-x-1 gap-y-2 text-base leading-loose text-ink">
            {nodes}
          </div>
        </div>
      </div>

      {submitted && !allCorrect && (
        <div className="mt-3 ml-10 rounded-xl bg-red-50 p-3">
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
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted">{question.grammar_reference}</span>
            {notionSlug && <ReviewNotionLink notionSlug={notionSlug} />}
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  exam: Exam;
  /** Leave the quiz and return to the grammar reference. */
  onExit: () => void;
  /** Reset the detail pane's scroll position (desktop) / window scroll
   * (mobile) — called on phase transitions so a new screen starts at
   * the top. */
  scrollToTop: () => void;
};

export default function ExamQuiz({ exam, onExit, scrollToTop }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [startSectionId, setStartSectionId] = useState<string>(exam.sections[0].section_id);

  // The run order rotates to start at whichever section the user picked,
  // then continues through the rest in their normal order — every run
  // covers all 3 sections exactly once, exam-style.
  const [sectionOrder, setSectionOrder] = useState<ExamSection[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);

  const [inputs, setInputs] = useState<Record<number, string[]>>({});
  const [results, setResults] = useState<Record<number, boolean[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sectionScores, setSectionScores] = useState<SectionStat[]>([]);
  const [savedSession, setSavedSession] = useState(false);

  const totalBlanks = useMemo(
    () => exam.sections.reduce((n, sec) => n + sec.questions.reduce((m, q) => m + q.answers.length, 0), 0),
    [exam]
  );
  const totalQuestions = useMemo(
    () => exam.sections.reduce((n, sec) => n + sec.questions.length, 0),
    [exam]
  );

  const section = sectionOrder[sectionIndex];

  function resetSectionState(sec: ExamSection) {
    const initial: Record<number, string[]> = {};
    for (const q of sec.questions) initial[q.id] = new Array(q.answers.length).fill("");
    setInputs(initial);
    setResults({});
    setSubmitted(false);
  }

  function startExam(fromSectionId: string) {
    const startIdx = exam.sections.findIndex((s) => s.section_id === fromSectionId);
    const rotated = [...exam.sections.slice(startIdx), ...exam.sections.slice(0, startIdx)];
    // Each section's own questions are shuffled — the section order
    // itself stays fixed (rotated to the chosen start), only what's
    // inside each one is randomized per round.
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
      const blankResults = q.answers.map((variants, i) => isBlankCorrect(inputs[q.id]?.[i] ?? "", variants));
      newResults[q.id] = blankResults;
      correct += blankResults.filter(Boolean).length;
      total += blankResults.length;
    }
    setResults(newResults);
    setSubmitted(true);
    setSectionScores((prev) => [
      ...prev,
      { section_id: section.section_id, title: section.title, correct, total },
    ]);
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

  function retryExam() {
    startExam(startSectionId);
  }

  function backToSetup() {
    setPhase("setup");
    scrollToTop();
  }

  const overallCorrect = sectionScores.reduce((n, s) => n + s.correct, 0);
  const overallTotal = sectionScores.reduce((n, s) => n + s.total, 0);

  // Save once the whole exam is done, same pattern as the MCQ quiz:
  // `sessions.level_id` is nullable, so this isn't tied to a DB module.
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-accent-700"
              aria-hidden
            >
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
            {exam.title}
          </h2>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Mock exam · N5</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            One section at a time, exam-style: fill in every blank in a
            section, then submit it all together to see your score before
            moving to the next one.
          </p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Start with
          </p>
          <div className="flex flex-wrap gap-2">
            {exam.sections.map((sec, i) => (
              <Pill
                key={sec.section_id}
                label={`Section ${i + 1} · ${SECTION_ENGLISH_LABEL[sec.section_id] ?? sec.title}`}
                selected={startSectionId === sec.section_id}
                onClick={() => setStartSectionId(sec.section_id)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => startExam(startSectionId)}
          className="btn-accent mt-8 w-full justify-center !rounded-2xl !py-3 text-base"
        >
          Start → ({totalBlanks} blanks · {totalQuestions} questions · 3 sections)
        </button>
      </div>
    );
  }

  // ─── FINAL RESULTS ──────────────────────────────────────────────────
  if (phase === "final") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <ResultsSummary correct={overallCorrect} total={overallTotal} unitLabel="blanks correct" />

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
                  <span className="min-w-0 truncate text-sm font-medium text-ink">
                    {s.section_id} {s.title}
                  </span>
                  <span className="shrink-0 text-xs font-normal text-muted">
                    {s.correct}/{s.total} correct
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ResultsActions
          onRetry={retryExam}
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

  const sectionBlankTotal = section.questions.reduce((n, q) => n + q.answers.length, 0);
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
        <button
          onClick={onExit}
          className="text-sm font-medium text-muted transition hover:text-primary"
        >
          Exit quiz
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-soft p-4">
        <div className="jp text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
          {section.section_id}
        </div>
        <h2 className="text-xl font-bold text-ink">{section.title}</h2>
        <p className="mt-2 text-sm text-sumi">{section.instructions}</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
          Example
        </p>
        <ExampleBlock example={section.example} />
      </div>

      {submitted && (
        <div className="mb-6 rounded-2xl bg-primary-50 p-4 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
            Section score
          </div>
          <div className="mt-1 text-3xl font-bold text-primary">
            {sectionCorrect} / {sectionBlankTotal}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {section.questions.map((q) => (
          <QuestionRow
            key={q.id}
            question={q}
            values={inputs[q.id] ?? []}
            onChange={(i, v) => updateInput(q.id, i, v)}
            submitted={submitted}
            blankResults={results[q.id]}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        {!submitted ? (
          <button type="button" onClick={submitSection} className="btn-primary">
            Submit section
          </button>
        ) : (
          <button
            type="button"
            onClick={nextSection}
            className="btn-accent !rounded-2xl !py-3 sm:px-10"
          >
            {isLastSection ? "See final results →" : "Next section →"}
          </button>
        )}
      </div>
    </div>
  );
}
