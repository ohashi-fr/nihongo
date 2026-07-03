"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EditDeckModal from "@/components/EditDeckModal";
import AddCardForm from "@/components/AddCardForm";
import { illustrationUrl } from "@/lib/deckIllustrations";
import { revalidateDeck, revalidateDecksList } from "@/app/reviews/actions";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";

/**
 * Deck detail client. Renders:
 *
 *   1. A card list (empty state included).
 *   2. An "Add card" flow with an inline dictionary autocomplete.
 *      Typing hits `/api/dict/search`; tapping a suggestion prefills
 *      the three editable fields (kanji / reading / meaning_en) plus
 *      an optional freeform note.
 *   3. A "Review this deck" link that navigates to the flashcard
 *      flip UI at /reviews/decks/[deckId]/review.
 *
 * The `custom_cards` table has RLS; inserts/deletes hit Supabase
 * directly via the browser client and rely on the user's session.
 * Failures surface inline and roll back optimistic state.
 */

type Props = {
  deck: CustomDeck;
  initialCards: CustomCard[];
  userId: string;
};

export default function CustomDeckClient({
  deck,
  initialCards,
  userId,
}: Props) {
  const router = useRouter();
  const [cards, setCards] = useState<CustomCard[]>(initialCards);
  const [showAdd, setShowAdd] = useState(initialCards.length === 0);
  const [editing, setEditing] = useState(false);

  return (
    <div>
      {/* ── Deck header — illustration + edit affordance ─────────── */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-card">
        <Image
          src={illustrationUrl(deck.illustration)}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-[0.15em] text-muted">
            Custom deck
          </div>
          <div className="truncate text-sm font-semibold text-ink">
            {deck.name}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit deck"
          title="Edit deck"
          className="shrink-0 rounded-full p-2 text-muted transition hover:bg-soft hover:text-primary"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
      </div>

      <EditDeckModal
        open={editing}
        onClose={() => setEditing(false)}
        deck={deck}
      />

      {/* ── Add card flow ────────────────────────────────────────── */}
      {showAdd ? (
        <div className="mb-6">
          <AddCardForm
            deckId={deck.id}
            userId={userId}
            onCancel={() => setShowAdd(false)}
            onAdded={(card) => setCards((c) => [card, ...c])}
            autoFocus
          />
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="btn-accent px-4 py-2 text-sm"
          >
            + Add card
          </button>
          {cards.length > 0 && (
            <Link
              href={`/reviews/decks/${deck.id}/review`}
              className="btn-outline px-4 py-2 text-sm"
            >
              Review this deck →
            </Link>
          )}
        </div>
      )}

      {/* ── Card list ────────────────────────────────────────────── */}
      <CardList
        cards={cards}
        onDelete={async (cardId) => {
          const prev = cards;
          setCards((c) => c.filter((x) => x.id !== cardId));
          const supabase = createClient();
          const { error } = await supabase
            .from("custom_cards")
            .delete()
            .eq("id", cardId);
          if (error) {
            // eslint-disable-next-line no-console
            console.error("[custom_cards] delete failed:", error);
            setCards(prev);
          } else {
            // Purge router cache for this deck + the /reviews list
            // (card count on the deck card just changed).
            void revalidateDeck(deck.id);
          }
        }}
      />

      {/* ── Deck destructive action ─────────────────────────────── */}
      <div className="mt-10 border-t border-border pt-6">
        <DeleteDeckButton deckId={deck.id} deckName={deck.name} />
      </div>
    </div>
  );
}

// =============================================================
// Card list + card row
// =============================================================
function CardList({
  cards,
  onDelete,
}: {
  cards: CustomCard[];
  onDelete: (id: string) => void;
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted">
        No cards yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {cards.map((c) => (
        <li
          key={c.id}
          className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-card"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="jp text-lg text-ink">{c.reading}</span>
              {c.kanji && (
                <span className="jp text-base text-muted">{c.kanji}</span>
              )}
            </div>
            <div className="mt-1 text-sm text-ink">{c.meaning_en}</div>
            {c.note && (
              <div className="mt-1 text-xs italic text-muted">{c.note}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDelete(c.id)}
            aria-label="Delete card"
            title="Delete card"
            className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-red-600"
          >
            <svg
              width="18"
              height="18"
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
          </button>
        </li>
      ))}
    </ul>
  );
}

// =============================================================
// Delete-deck confirmation button
// =============================================================
function DeleteDeckButton({
  deckId,
  deckName,
}: {
  deckId: string;
  deckName: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("custom_decks")
      .delete()
      .eq("id", deckId);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[custom_decks] delete failed:", error);
      setBusy(false);
      return;
    }
    // Purge the list before navigating so the deck really disappears.
    await revalidateDecksList();
    router.push("/reviews");
  }

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="text-xs text-muted transition hover:text-red-600"
      >
        Delete this deck
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
      <p>
        Delete <span className="font-semibold">{deckName}</span> and all its
        cards?
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setAsking(false)}
          disabled={busy}
          className="rounded-lg border border-red-200 bg-white px-3 py-1 font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className="rounded-lg bg-red-600 px-3 py-1 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
