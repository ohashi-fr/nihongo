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

function ItemButton({
  active,
  onClick,
  number,
  subtitle,
  children,
}: {
  active: boolean;
  onClick: () => void;
  number?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`group/item flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm leading-snug transition ${
        active
          ? "bg-primary font-semibold text-white shadow-soft"
          : "text-sumi hover:bg-soft"
      }`}
    >
      {number !== undefined && (
        <span
          className={`mt-0.5 shrink-0 text-xs font-semibold tabular-nums ${
            active ? "text-white/70" : "text-muted"
          }`}
        >
          {number}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block">{children}</span>
        {subtitle && (
          <span
            className={`jp mt-0.5 block truncate text-[11px] font-normal ${
              active ? "text-white/60" : "text-muted/80"
            }`}
          >
            {subtitle}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`mt-0.5 shrink-0 self-start text-sm transition ${
          active
            ? "text-white/70"
            : "text-primary-300 opacity-0 group-hover/item:opacity-100"
        }`}
      >
        ›
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
      <div className="mb-3">
        <ItemButton active={selectedId === "socle"} onClick={() => onSelect("socle")}>
          {socle.sidebarLabel}
        </ItemButton>
      </div>

      <ul className="space-y-5">
        {groups.map((group) => (
          <li key={group.id}>
            <div className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
              {group.title}
            </div>
            <ul className="space-y-0.5">
              {group.notions.map((notion) => {
                const id = String(notion.number);
                const jpSubtitle = notion.titleKanji
                  ? `${notion.titleJp} ${notion.titleKanji}`
                  : notion.titleJp;
                return (
                  <li key={id}>
                    <ItemButton
                      active={selectedId === id}
                      onClick={() => onSelect(id)}
                      number={notion.number}
                      subtitle={jpSubtitle}
                    >
                      {notion.sidebarLabel}
                    </ItemButton>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-border pt-3">
        <ItemButton active={selectedId === "checklist"} onClick={() => onSelect("checklist")}>
          {checklist.sidebarLabel}
        </ItemButton>
      </div>
    </nav>
  );
}
