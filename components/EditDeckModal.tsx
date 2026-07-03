"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import IllustrationPicker from "@/components/IllustrationPicker";
import { safeIllustration } from "@/lib/deckIllustrations";
import type { CustomDeck } from "@/lib/customDecks";

/**
 * Rename + change-illustration modal for an existing deck. Same
 * layout as CreateDeckModal but keeps the current values as the
 * initial state, and dispatches an UPDATE (RLS-scoped) instead of an
 * INSERT. Closes on save; the parent triggers `router.refresh()` so
 * any list showing the deck picks up the new metadata.
 */

type Props = {
  open: boolean;
  onClose: () => void;
  deck: CustomDeck;
};

export default function EditDeckModal({ open, onClose, deck }: Props) {
  const router = useRouter();
  const [name, setName] = useState(deck.name);
  const [illustration, setIllustration] = useState(
    safeIllustration(deck.illustration)
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset fields whenever the modal is (re-)opened for the same deck
  // — so if the user cancels then re-opens they see current values.
  useEffect(() => {
    if (!open) return;
    setName(deck.name);
    setIllustration(safeIllustration(deck.illustration));
    setErr(null);
  }, [open, deck.name, deck.illustration]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setErr("Give the deck a name.");
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setErr(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("custom_decks")
      .update({ name: trimmed, illustration })
      .eq("id", deck.id);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[custom_decks] update failed:", error);
      setErr("Couldn't save changes.");
      setBusy(false);
      return;
    }

    setBusy(false);
    onClose();
    router.refresh();
  }

  function close() {
    if (busy) return;
    onClose();
  }

  return (
    <Modal open={open} onClose={close} ariaLabel="Edit deck">
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
        Edit deck
      </h2>
      <p className="mt-1 text-sm text-muted">
        Rename or swap the illustration.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-soft outline-none transition focus:border-primary"
        />

        <IllustrationPicker value={illustration} onChange={setIllustration} />

        {err && (
          <p role="alert" className="text-xs text-red-600">
            {err}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="btn-outline flex-1 justify-center disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn-accent flex-1 justify-center disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

