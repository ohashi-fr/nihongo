"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import IllustrationPicker from "@/components/IllustrationPicker";
import { DEFAULT_DECK_ILLUSTRATION } from "@/lib/deckIllustrations";
import { revalidateDecksList } from "@/app/reviews/actions";

/**
 * Small modal used to create a new custom deck. Inserts a row into
 * `custom_decks` with the current user's `user_id` (RLS enforces
 * ownership) and, on success, navigates to the fresh deck's detail
 * page so the user can immediately start adding cards.
 *
 * Failure modes surface inline — the modal never closes on error so
 * the user doesn't lose their typed name.
 */

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
};

export default function CreateDeckModal({ open, onClose, userId }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [illustration, setIllustration] = useState(DEFAULT_DECK_ILLUSTRATION);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const { data, error } = await supabase
      .from("custom_decks")
      .insert({ name: trimmed, user_id: userId, illustration })
      .select("id")
      .single();

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.error("[custom_decks] insert failed:", error);
      setErr("Something went wrong. Try again?");
      setBusy(false);
      return;
    }

    // Invalidate the cached /reviews list before we navigate away —
    // if the user hits "back" later they should see the new deck in
    // the grid. The just-created deck's detail page was never cached
    // (fresh id), so no separate invalidation is needed there.
    await revalidateDecksList();
    router.push(`/reviews/decks/${data.id}`);
  }

  function close() {
    if (busy) return;
    setName("");
    setIllustration(DEFAULT_DECK_ILLUSTRATION);
    setErr(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} ariaLabel="Create custom deck">
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
        New custom deck
      </h2>
      <p className="mt-1 text-sm text-muted">
        Give it a name — you can add cards next.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Words I heard at work"
          maxLength={80}
          autoFocus
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
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
