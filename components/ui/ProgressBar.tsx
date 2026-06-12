type Props = {
  /** Number between 0 and 1. Clamped. */
  value: number;
  className?: string;
  label?: string;
};

/**
 * Horizontal progress bar in the new accent orange. Used during quizzes
 * and on result screens to add a small gamified beat.
 */
export default function ProgressBar({ value, className = "", label }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span>{label}</span>
          <span className="text-primary">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
