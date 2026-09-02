"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

/**
 * Confirmation for clearing every card out of a deck without
 * deleting the deck itself. Used for both custom decks (clears
 * `custom_cards`) and the Favorites decks (clears `favorites` rows)
 * — the two mutations differ, so unlike <DeleteDeckModal> this one
 * doesn't own the delete query itself. The caller supplies it via
 * `onConfirm` and returns an error message on failure (or nothing
 * on success).
 */

type Props = {
  open: boolean;
  deckName: string | null;
  cardCount: number;
  onClose: () => void;
  onConfirm: () => Promise<string | void>;
  /** Called after a successful empty completes. */
  onEmptied: () => void;
};

export default function EmptyDeckModal({
  open,
  deckName,
  cardCount,
  onClose,
  onConfirm,
  onEmptied,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setErr(null);
    const error = await onConfirm();
    if (error) {
      setErr(error);
      setBusy(false);
      return;
    }
    setBusy(false);
    onEmptied();
  }

  function close() {
    if (busy) return;
    setErr(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} ariaLabel="Empty deck">
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
        Empty this deck?
      </h2>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        This removes all{" "}
        <span className="font-semibold">{cardCount}</span> card
        {cardCount === 1 ? "" : "s"} from{" "}
        <span className="font-semibold">{deckName ?? "this deck"}</span>.
        The deck itself stays — you can add cards again later. This
        can&apos;t be undone.
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
          disabled={busy}
          className="flex flex-1 items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-amber-700 disabled:opacity-50"
        >
          {busy ? "Emptying…" : "Empty deck"}
        </button>
      </div>
    </Modal>
  );
}
