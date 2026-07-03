"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import AddCardForm from "@/components/AddCardForm";
import CreateDeckModal from "@/components/CreateDeckModal";
import { createClient } from "@/lib/supabase/client";
import { illustrationUrl } from "@/lib/deckIllustrations";

/**
 * Modal launched from the mobile bottom-nav "Add card" button.
 *
 * Shows a visible deck selector (pill list, pre-selected to the
 * most-recently-used deck) above the same `AddCardForm` that the
 * deck-detail page uses. If the user has no decks yet, the modal
 * first prompts to create one — no auto-created "Quick" deck, no
 * hidden deck routing.
 *
 * The user's user id and deck list are fetched lazily on open so
 * this component can live in the root layout without doing any work
 * until it's actually needed.
 */

type MinimalDeck = {
  id: string;
  name: string;
  illustration: string | null;
  last_used_at: string | null;
  created_at: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function QuickAddCardModal({ open, onClose }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<MinimalDeck[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Reload decks each time the modal opens — cheap and keeps
  // "most-recently-used" honest even if the user added a card via
  // another surface since the last mount.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setUserId(null);
        setDecks([]);
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("custom_decks")
        .select("id, name, illustration, last_used_at, created_at")
        // Most-recently-used first — nulls (never used) sort last.
        .order("last_used_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (!active) return;
      const rows = (data ?? []) as MinimalDeck[];
      setDecks(rows);
      // Pre-select MRU deck. This is the "last deck the user added
      // to", not the newest one — matches the spec.
      setSelectedId(rows[0]?.id ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const selectedDeck = useMemo(
    () => decks.find((d) => d.id === selectedId) ?? null,
    [decks, selectedId]
  );

  function close() {
    onClose();
  }

  return (
    <>
      <Modal open={open} onClose={close} ariaLabel="Add card" size="max-w-lg">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-ink"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>

        <h2 className="text-lg font-bold tracking-tight text-ink">
          Add a card
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading your decks…</p>
        ) : !userId ? (
          <p className="mt-4 text-sm text-muted">
            You need to be logged in to add cards.
          </p>
        ) : decks.length === 0 ? (
          <div className="mt-4">
            <p className="text-sm text-muted">
              You don&apos;t have a custom deck yet. Create one — you can add
              cards to it right after.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="btn-accent mt-4 w-full justify-center"
            >
              + New deck
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Deck selector — visible pill row */}
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                Deck
              </div>
              <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                {decks.map((d) => {
                  const active = d.id === selectedId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedId(d.id)}
                      aria-pressed={active}
                      className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-accent bg-accent/10 font-semibold text-primary shadow-soft"
                          : "border-border bg-white text-muted hover:border-primary/40 hover:text-ink"
                      }`}
                    >
                      <Image
                        src={illustrationUrl(d.illustration)}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                      <span className="max-w-[140px] truncate">{d.name}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex shrink-0 snap-start items-center gap-1 rounded-full border border-dashed border-border bg-white px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-primary"
                >
                  + New
                </button>
              </div>
            </div>

            {selectedDeck && (
              <AddCardForm
                key={selectedDeck.id}
                deckId={selectedDeck.id}
                userId={userId}
                heading=""
                autoFocus
                onCancel={close}
                onAdded={() => {
                  /* Deck stays open — user can keep adding. AddCardForm
                     already resets its own fields on success. */
                }}
              />
            )}
          </div>
        )}
      </Modal>

      {userId && (
        <CreateDeckModal
          open={creating}
          onClose={() => setCreating(false)}
          userId={userId}
        />
      )}
    </>
  );
}
