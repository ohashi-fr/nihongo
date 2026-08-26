"use client";

type Props = {
  onSelectMcq?: () => void;
  onSelectExam?: () => void;
  onSelectTraining?: () => void;
  mcqQuestionCount?: number;
  examBlankCount?: number;
  examSectionCount?: number;
  trainingQuestionCount?: number;
  trainingSectionCount?: number;
};

/**
 * Shown when the sidebar's "Test yourself" entry is clicked. Which
 * tiles appear depends entirely on which `onSelect*` handlers the
 * active module passes in — the MCQ grammar quiz and N5 mock exam for
 * L1–L3, the L4–L5 training quiz for L4–L5. Picking one hands off to
 * that quiz's own pre-quiz screen.
 */
export default function QuizChooser({
  onSelectMcq,
  onSelectExam,
  onSelectTraining,
  mcqQuestionCount,
  examBlankCount,
  examSectionCount,
  trainingQuestionCount,
  trainingSectionCount,
}: Props) {
  const visibleCount = [onSelectMcq, onSelectExam, onSelectTraining].filter(Boolean).length;
  const containerWidth =
    visibleCount >= 3 ? "max-w-3xl" : visibleCount === 2 ? "max-w-2xl" : "max-w-md";
  const gridCols = visibleCount >= 3 ? "sm:grid-cols-3" : visibleCount === 2 ? "sm:grid-cols-2" : "";
  const subtitle =
    visibleCount >= 3
      ? "A few ways to practice the grammar notions — pick one to start."
      : visibleCount === 2
        ? "Two ways to practice the grammar notions — pick one to start."
        : "Practice this module's grammar notions.";

  return (
    <div className={`mx-auto ${containerWidth}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Test yourself
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{subtitle}</p>
      </div>

      <div className={`mt-8 grid gap-4 ${gridCols}`}>
        {onSelectMcq && (
          <button
            type="button"
            onClick={onSelectMcq}
            className="card-tile group flex flex-col items-start text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-primary"
                aria-hidden
              >
                <path
                  d="M9 12.5l2 2 4-4.5M12 3a9 9 0 100 18 9 9 0 000-18z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">Grammar quiz</h3>
            <p className="mt-1.5 text-sm text-muted">
              Multiple-choice questions across all grammar notions.
            </p>
            <div className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-xs">
              <span className="font-medium text-muted">
                {mcqQuestionCount} questions
              </span>
              <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
                Start →
              </span>
            </div>
          </button>
        )}

        {onSelectExam && (
          <button
            type="button"
            onClick={onSelectExam}
            className="card-tile group flex flex-col items-start text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-accent-700"
                aria-hidden
              >
                <path
                  d="M4 19.5V6a2 2 0 012-2h9l5 5v10.5a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 13h6M9 16.5h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="jp mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
              中間テスト練習問題
            </h3>
            <h3 className="text-lg font-bold text-ink">Mock exam · N5</h3>
            <p className="mt-1.5 text-sm text-muted">
              Fill-in-the-blank practice exam, JLPT N5 style.
            </p>
            <div className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-xs">
              <span className="font-medium text-muted">
                {examBlankCount} blanks · {examSectionCount} sections
              </span>
              <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
                Start →
              </span>
            </div>
          </button>
        )}

        {onSelectTraining && (
          <button
            type="button"
            onClick={onSelectTraining}
            className="card-tile group flex flex-col items-start text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-accent-700"
                aria-hidden
              >
                <path
                  d="M12 20l9-5-9-5-9 5 9 5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12.5V5m0 0L4.5 9m7.5-4L19.5 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="jp mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
              クイズ②前 復習プリント
            </h3>
            <h3 className="text-lg font-bold text-ink">Training quiz</h3>
            <p className="mt-1.5 text-sm text-muted">
              Mixed review for L4–L5: particles, verbs, choices, and free answers.
            </p>
            <div className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-xs">
              <span className="font-medium text-muted">
                {trainingQuestionCount} questions · {trainingSectionCount} sections
              </span>
              <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
                Start →
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
