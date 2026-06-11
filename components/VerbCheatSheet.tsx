"use client";

import { useEffect, useMemo } from "react";
import type { VerbFields } from "@/components/VerbFlashcardClient";
import { deriveHiragana } from "@/lib/verbReadings";

type Props = {
  open: boolean;
  onClose: () => void;
  cards: { id: string; fields: VerbFields }[];
};

/**
 * Wide cheat sheet modal — full table view of every card in the level.
 * Sorted by translation_en. Close on click-outside, on × button, or Esc.
 */
export default function VerbCheatSheet({ open, onClose, cards }: Props) {
  // Esc to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sorted = useMemo(
    () =>
      cards
        .slice()
        .sort((a, b) =>
          a.fields.translation_en.localeCompare(b.fields.translation_en)
        ),
    [cards]
  );

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cheat Sheet"
        aria-hidden={!open}
        className={`fixed inset-4 z-50 mx-auto flex max-w-6xl flex-col rounded-lg border border-border bg-white shadow-card transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold tracking-tight">
            Cheat Sheet
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{sorted.length} verbs</span>
            <button
              onClick={onClose}
              aria-label="Close cheat sheet"
              className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-soft hover:text-ink"
            >
              ×
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-soft text-left text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <Th>English</Th>
                <Th>Dictionary</Th>
                <Th>Group</Th>
                <Th>Masu</Th>
                <Th>Te</Th>
                <Th>Ta</Th>
                <Th>Nai</Th>
                <Th>Potential</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ id, fields: f }) => {
                const dict = f.dictionary_form;
                return (
                  <tr key={id} className="border-b border-border">
                    <Td>{f.translation_en}</Td>
                    {/* Dictionary column stays kanji + reading */}
                    <Td jp>{dict}</Td>
                    <Td>{f.group}</Td>
                    {/* Form columns rendered in full hiragana */}
                    <Td jp>{deriveHiragana(f.masu_form, dict)}</Td>
                    <Td jp>{deriveHiragana(f.te_form, dict)}</Td>
                    <Td jp>{deriveHiragana(f.ta_form, dict)}</Td>
                    <Td jp>{deriveHiragana(f.nai_form, dict)}</Td>
                    <Td jp>{deriveHiragana(f.potential_form, dict)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-border px-3 py-2 font-semibold">
      {children}
    </th>
  );
}

function Td({
  children,
  jp,
}: {
  children: React.ReactNode;
  jp?: boolean;
}) {
  return (
    <td
      className={`whitespace-nowrap border-b border-border px-3 py-2 ${
        jp ? "jp" : ""
      }`}
    >
      {children || "—"}
    </td>
  );
}
