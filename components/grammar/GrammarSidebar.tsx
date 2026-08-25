"use client";

import type { ChecklistSection, Group, SocleSection } from "@/content/grammar/grammar-data";

type Props = {
  groups: Group[];
  socle?: SocleSection;
  checklist: ChecklistSection;
  hasQuiz?: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
};

/**
 * One notion entry, styled as an encapsulated card — matches the level
 * rows on the Vocabulary/module pages (number badge, label, → chevron),
 * with a Japanese subtitle line added underneath.
 *
 * `highlight` gives the inactive card an accent tint, used only for the
 * "start here" socle entry so it stands out above the numbered notions.
 */
function NotionCard({
  active,
  onClick,
  badge,
  subtitle,
  highlight = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: React.ReactNode;
  subtitle?: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`group/card flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover ${
        active
          ? "bg-primary"
          : highlight
          ? "border border-accent-200 bg-accent-50"
          : "bg-white"
      }`}
    >
      {badge !== undefined && (
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
            active
              ? "bg-white/15 text-white"
              : highlight
              ? "bg-accent-500 text-white"
              : "bg-primary-50 text-primary"
          }`}
        >
          {badge}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-semibold ${
            active ? "text-white" : "text-ink"
          }`}
        >
          {children}
        </span>
        {subtitle && (
          <span
            className={`jp mt-0.5 block truncate text-[11px] ${
              active ? "text-white/70" : "text-muted"
            }`}
          >
            {subtitle}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`shrink-0 text-sm font-semibold transition ${
          active
            ? "text-white/80"
            : "text-primary opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-0.5"
        }`}
      >
        →
      </span>
    </button>
  );
}

/**
 * The quiz entry point — deliberately styled apart from the notion
 * cards (orange accent, not white/blue) so it reads as an action to
 * take, not a lesson to read.
 */
function QuizCard({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`group/card flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover ${
        active ? "bg-accent-700" : "bg-accent"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-white/15" : "bg-white/40"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-5 w-5 ${active ? "text-white" : "text-primary"}`}
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
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-bold ${
            active ? "text-white" : "text-primary"
          }`}
        >
          Test yourself
        </span>
        <span
          className={`mt-0.5 block truncate text-[11px] font-medium ${
            active ? "text-white/70" : "text-primary/70"
          }`}
        >
          MCQ quiz · Mock exam N5
        </span>
      </span>
      <span
        aria-hidden
        className={`shrink-0 text-sm font-semibold transition ${
          active
            ? "text-white/80"
            : "text-primary opacity-70 group-hover/card:opacity-100 group-hover/card:translate-x-0.5"
        }`}
      >
        →
      </span>
    </button>
  );
}

export default function GrammarSidebar({
  groups,
  socle,
  checklist,
  hasQuiz = false,
  selectedId,
  onSelect,
  className = "",
}: Props) {
  return (
    <nav aria-label="Grammar notions" className={className}>
      {hasQuiz && (
        <div className="mb-3">
          <QuizCard
            active={selectedId === "quiz" || selectedId === "quiz-mcq" || selectedId === "quiz-exam"}
            onClick={() => onSelect("quiz")}
          />
        </div>
      )}

      {socle && (
        <div className="mb-6">
          <NotionCard
            active={selectedId === "socle"}
            onClick={() => onSelect("socle")}
            badge="★"
            subtitle={socle.jpTitle}
            highlight
          >
            {socle.sidebarLabel}
          </NotionCard>
        </div>
      )}

      <ul className="space-y-6">
        {groups.map((group) => (
          <li key={group.id}>
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
              {group.title}
            </div>
            <ul className="space-y-2">
              {group.notions.map((notion) => {
                const id = notion.slug;
                const jpSubtitle = notion.titleKanji
                  ? `${notion.titleJp} ${notion.titleKanji}`
                  : notion.titleJp;
                return (
                  <li key={id}>
                    <NotionCard
                      active={selectedId === id}
                      onClick={() => onSelect(id)}
                      badge={String(notion.courseNumber ?? notion.number).padStart(2, "0")}
                      subtitle={jpSubtitle}
                    >
                      {notion.sidebarLabel}
                    </NotionCard>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-border pt-5">
        <NotionCard
          active={selectedId === "checklist"}
          onClick={() => onSelect("checklist")}
          badge="✓"
        >
          {checklist.sidebarLabel}
        </NotionCard>
      </div>
    </nav>
  );
}
