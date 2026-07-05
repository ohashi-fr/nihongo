"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import type { CustomDeck } from "@/lib/customDecks";

/**
 * Deck-deletion confirmation. Reminds the user of the deck name and
 * card count, warns the action is permanent, and offers a danger-
 * styled "Delete" alongside a neutral "Cancel".
 *
 * Cascade: DELETE FROM custom_decks WHERE id = ? cascades to
 *   custom_cards → custom_card_reviews (both FKs have
 *   ON DELETE CASCADE — see supabase/migrate_ensure_cascades.sql
 *   if you're setting up a fresh DB or want to double-check).
 *
 * RLS: the DELETE policy on custom_decks scopes the mutation to
 *   `user_id = auth.uid()`, so a client can't drop someone else's
 *   deck even if they guess the id.
 *
 * The modal only performs the DB delete + reports back. Local
 * list mutation, redirect, and the toast are the caller's job —
 * because the "where to go afterwards" differs between the deck
 * list and the deck detail page.
 */

type Props = {
  open: boolean;
  deck: Pick<CustomDeck, "id" | "name"> | null;
  cardCount: number;
  onClose: () => void;
  /** Called after a successful delete completes. */
  onDeleted: () => void;
};

export default function DeleteDeckModal({
  open,
  deck,
  cardCount,
  onClose,
  onDeleted,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirm() {
    if (!deck) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("custom_decks")
      .delete()
      .eq("id", deck.id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[custom_decks] delete failed:", error);
      setErr(
        `${error.code ? `[${error.code}] ` : ""}${error.message}` +
          (error.hint ? ` — ${error.hint}` : "")
      );
      setBusy(false);
      return;
    }
    setBusy(false);
    onDeleted();
  }

  function close() {
    if (busy) return;
    setErr(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} ariaLabel="Delete deck">
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
        Delete this deck?
      </h2>

      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        You&apos;re about to permanently delete{" "}
        <span className="font-semibold">{deck?.name ?? "this deck"}</span>{" "}
        and its <span className="font-semibold">{cardCount}</span>{" "}
        card{cardCount === 1 ? "" : "s"}. All review progress
        (boxes, due dates, lapses) for those cards will also be
        removed. This can&apos;t be undone.
      </div>

      {err && (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {err}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={close}
          disabled={busy}
          className="btn-outline flex-1 justify-center disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy || !deck}
          className="flex flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete deck"}
        </button>
      </div>
    </Modal>
  );
}
