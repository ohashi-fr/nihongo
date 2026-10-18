"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import KanjiQuizClient, {
  KanjiBackContent,
  parseKanjiFields,
} from "@/components/KanjiQuizClient";
import type { Card } from "@/lib/types";

export type KanjiGridCard = Pick<Card, "id" | "fields">;

export type KanjiGridGroup = {
  id: string;
  name: string;
  cards: KanjiGridCard[];
};

const GRID_URL = "/modules/kanji?tab=all";

/**
 * "All kanji" tab. Browse mode: tap a tile → card modal. Training mode:
 * tap toggles selection (per-group checkboxes, select-all, sticky action
 * bar) and "Start review" runs the regular flashcard player on just the
 * selected kanji. `selected === null` means training is off, so leaving
 * training discards the selection and re-entering starts from "all".
 */
export default function KanjiGrid({ groups }: { groups: KanjiGridGroup[] }) {
  const router = useRouter();
  const [detail, setDetail] = useState<{
    group: string;
    card: KanjiGridCard;
  } | null>(null);
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [session, setSession] = useState<KanjiGridCard[] | null>(null);

  const allCards = useMemo(() => groups.flatMap((g) => g.cards), [groups]);
  const total = allCards.length;
  const training = selected !== null;
  const count = selected?.size ?? 0;
  const allSelected = training && count === total;

  if (total === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
        No kanji yet.
      </p>
    );
  }

  function setTraining(on: boolean) {
    setSelected(on ? new Set(allCards.map((c) => c.id)) : null);
  }

  function toggleCard(id: string) {
    setSelected((prev) => {
      if (!prev) return prev;
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleGroup(g: KanjiGridGroup) {
    setSelected((prev) => {
      if (!prev) return prev;
      const next = new Set(prev);
      const every = g.cards.every((c) => next.has(c.id));
      for (const c of g.cards) {
        if (every) next.delete(c.id);
        else next.add(c.id);
      }
      return next;
    });
  }

  function startReview() {
    if (!selected || selected.size === 0) return;
    setSession(allCards.filter((c) => selected.has(c.id)));
    // Drop any stale ?mode= so the player opens on its mode picker.
    router.replace(GRID_URL, { scroll: false });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }

  function exitSession() {
    setSession(null);
    router.replace(GRID_URL, { scroll: false });
  }

  if (session) {
    return (
      <div>
        <button
          type="button"
          onClick={exitSession}
          className="mb-4 rounded-md text-sm text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          ← Back to selection
        </button>
        <KanjiQuizClient
          cards={session}
          levelId="selection"
          slug="kanji"
          levelName="Custom review"
          initialShuffle
          startHref={(mode) => `${GRID_URL}&mode=${mode}`}
          hideBackLink
        />
      </div>
    );
  }

  const detailFields = detail ? parseKanjiFields(detail.card) : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted">
          {total} kanji · {groups.length} groups
        </p>
        <div className="flex items-center gap-5">
          {training && (
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(allCards.map((c) => c.id)))}
              className="rounded-md text-sm font-medium text-primary transition hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={training}
            onClick={() => setTraining(!training)}
            className="inline-flex items-center gap-2.5 rounded-full text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className={`relative h-5 w-9 rounded-full transition-colors motion-reduce:transition-none ${
                training ? "bg-accent-500" : "bg-muted/40"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-soft transition-transform motion-reduce:transition-none ${
                  training ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
            Training mode
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {groups.map((g) => {
          const picked = selected
            ? g.cards.filter((c) => selected.has(c.id)).length
            : 0;
          const every = picked === g.cards.length;
          return (
            <section key={g.id} aria-labelledby={`kanji-group-${g.id}`}>
              <div className="mb-3 flex items-center gap-3">
                {training && (
                  <GroupCheckbox
                    id={`kanji-group-check-${g.id}`}
                    checked={every}
                    indeterminate={picked > 0 && !every}
                    onChange={() => toggleGroup(g)}
                  />
                )}
                <h2
                  id={`kanji-group-${g.id}`}
                  className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted"
                >
                  {training ? (
                    <label
                      htmlFor={`kanji-group-check-${g.id}`}
                      className="cursor-pointer"
                    >
                      {g.name}
                    </label>
                  ) : (
                    g.name
                  )}
                </h2>
                <span className="text-[11px] tabular-nums text-muted/70">
                  {training ? `${picked}/${g.cards.length}` : g.cards.length}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>

              <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-1.5">
                {g.cards.map((card) => {
                  const f = parseKanjiFields(card);
                  const on = selected?.has(card.id) ?? false;
                  return (
                    <li key={card.id}>
                      <button
                        type="button"
                        onClick={() =>
                          training
                            ? toggleCard(card.id)
                            : setDetail({ group: g.name, card })
                        }
                        aria-pressed={training ? on : undefined}
                        aria-label={
                          f.meanings.length > 0
                            ? `${f.kanji}, ${f.meanings.join(", ")}`
                            : f.kanji
                        }
                        className={`jp relative flex aspect-square w-full items-center justify-center rounded-xl border text-[2rem] leading-none shadow-soft transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                          training
                            ? on
                              ? "border-accent-500 bg-accent-50 text-ink ring-1 ring-accent-500"
                              : "border-border bg-white text-ink opacity-40 hover:opacity-70"
                            : "border-border bg-white text-ink hover:border-accent-300 hover:bg-accent-50 hover:text-primary"
                        }`}
                      >
                        {f.kanji}
                        {training && on && (
                          <span
                            aria-hidden="true"
                            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-primary"
                          >
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.5 6.5l2.2 2.2 4.8-5" />
                            </svg>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {training && (
        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 mt-10 sm:bottom-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-cardHover backdrop-blur">
            <p aria-live="polite" className="text-sm">
              <span className="font-semibold tabular-nums text-ink">{count}</span>{" "}
              <span className="text-muted">kanji selected</span>
            </p>
            <button
              type="button"
              onClick={startReview}
              disabled={count === 0}
              className="btn-accent !px-5 !py-2 disabled:pointer-events-none disabled:opacity-40"
            >
              Start review →
            </button>
          </div>
        </div>
      )}

      {detail && detailFields && (
        <Modal
          open
          onClose={() => setDetail(null)}
          size="max-w-md"
          ariaLabel={`Kanji ${detailFields.kanji}`}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
              {detail.group}
            </div>
            <button
              type="button"
              onClick={() => setDetail(null)}
              aria-label="Close"
              className="-mr-2 -mt-2 rounded-md px-2 py-1 text-lg leading-none text-muted transition hover:bg-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              ×
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <KanjiBackContent fields={detailFields} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function GroupCheckbox({
  id,
  checked,
  indeterminate,
  onChange,
}: {
  id: string;
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer rounded accent-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    />
  );
}
