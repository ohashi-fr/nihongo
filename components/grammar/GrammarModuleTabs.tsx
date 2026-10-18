"use client";

import { useRef } from "react";

type Tab = { id: string; label: string };

/**
 * Level switcher for the Grammar page. Underline tabs — uppercase,
 * letter-spaced labels on a shared baseline, with a colored bar under
 * the active tab only. Matches the app's existing uppercase/tracking
 * micro-label idiom (section headers, badges) instead of a standalone
 * pill control.
 */
export default function GrammarModuleTabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = "Grammar level",
}: {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function focusAndSelect(id: string) {
    onChange(id);
    buttonRefs.current[id]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    focusAndSelect(next.id);
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className="flex gap-8 overflow-x-auto border-b border-border pb-px">
      {tabs.map((tab, index) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`relative -mb-px shrink-0 whitespace-nowrap pb-3 text-[11px] font-bold uppercase tracking-[0.09em] transition ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
            <span
              className={`absolute inset-x-0 bottom-0 h-[3px] rounded-full transition ${
                active ? "bg-accent-500" : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
