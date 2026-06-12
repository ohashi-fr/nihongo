type Props = {
  /** Optional small eyebrow above the title (e.g. "Module"). */
  kicker?: string;
  title: string;
  subtitle?: string;
  className?: string;
  right?: React.ReactNode;
};

/**
 * Big page title in the new design system. Used at the top of every
 * top-level screen so headings stay consistent (size, kicker, spacing).
 */
export default function SectionHeader({
  kicker,
  title,
  subtitle,
  className = "",
  right,
}: Props) {
  return (
    <div className={`mb-8 flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {kicker && (
          <div className="mb-2 inline-flex items-center rounded-full bg-accent-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">
            {kicker}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
