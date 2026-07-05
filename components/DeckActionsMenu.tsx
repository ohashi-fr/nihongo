"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Small "⋯" popover menu attached to a deck. Renders a discreet
 * button; clicking it reveals a menu with the destructive
 * "Delete deck" action. Dismisses on outside click, on Escape, or
 * on picking a menu item.
 *
 * Uses only structural affordances the caller passes in as
 * callbacks — this component holds *no* delete/confirm state on
 * its own. Confirmation is the caller's responsibility (via the
 * DeleteDeckModal).
 */

type Props = {
  onDelete: () => void;
  /** Optional accessible label — defaults to "Deck actions". */
  label?: string;
  /**
   * Tone the trigger button. Use "onDark" when the menu sits on a
   * dark-heavy card (rare for us — default suits the current UI).
   */
};

export default function DeckActionsMenu({
  onDelete,
  label = "Deck actions",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full p-2 text-muted transition hover:bg-soft hover:text-ink"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-44 overflow-hidden rounded-2xl border border-border bg-white p-1 shadow-cardHover"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14" />
            </svg>
            <span>Delete deck</span>
          </button>
        </div>
      )}
    </div>
  );
}
