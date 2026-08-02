"use client";

import type { ChecklistSection, Group, SocleSection } from "@/content/grammar/grammar-data";

type Props = {
  groups: Group[];
  socle: SocleSection;
  checklist: ChecklistSection;
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

export default function GrammarSidebar({
  groups,
  socle,
  checklist,
  selectedId,
  onSelect,
  className = "",
}: Props) {
  return (
    <nav aria-label="Grammar notions" className={className}>
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

      <ul className="space-y-6">
        {groups.map((group) => (
          <li key={group.id}>
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
              {group.title}
            </div>
            <ul className="space-y-2">
              {group.notions.map((notion) => {
                const id = String(notion.number);
                const jpSubtitle = notion.titleKanji
                  ? `${notion.titleJp} ${notion.titleKanji}`
                  : notion.titleJp;
                return (
                  <li key={id}>
                    <NotionCard
                      active={selectedId === id}
                      onClick={() => onSelect(id)}
                      badge={String(notion.number).padStart(2, "0")}
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
