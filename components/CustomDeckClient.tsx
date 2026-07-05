"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EditDeckModal from "@/components/EditDeckModal";
import AddCardForm from "@/components/AddCardForm";
import DeleteDeckModal from "@/components/DeleteDeckModal";
import DeckActionsMenu from "@/components/DeckActionsMenu";
import Toast from "@/components/ui/Toast";
import { illustrationUrl } from "@/lib/deckIllustrations";
import { revalidateDeck, revalidateDecksList } from "@/app/reviews/actions";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";
import {
  derivedState,
  isLeech,
  localISODate,
  MAX_SESSION,
  NEW_CARDS_PER_DAY,
  type CustomCardReview,
  type ReviewState,
} from "@/lib/leitner";

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
  initialReviews: CustomCardReview[];
  userId: string;
};

type Filter = "all" | ReviewState;

export default function CustomDeckClient({
  deck,
  initialCards,
  initialReviews,
  userId,
}: Props) {
  const router = useRouter();
  const [cards, setCards] = useState<CustomCard[]>(initialCards);
  const [reviews] = useState<CustomCardReview[]>(initialReviews);
  const [showAdd, setShowAdd] = useState(initialCards.length === 0);
  const [editing, setEditing] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState(false);
  // The card currently being edited via the reused AddCardForm.
  // When non-null, the form appears at the top in edit mode.
  const [editingCard, setEditingCard] = useState<CustomCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  // Card → its review row (if any). O(1) lookup for the list + counts.
  const reviewsByCard = useMemo(
    () => new Map(reviews.map((r) => [r.custom_card_id, r])),
    [reviews]
  );

  // Bucket cards by state so the filter chips can show counts and
  // the filtered list is trivial.
  const { newCards, learningCards, masteredCards } = useMemo(() => {
    const nb: CustomCard[] = [];
    const lb: CustomCard[] = [];
    const mb: CustomCard[] = [];
    for (const c of cards) {
      const s = derivedState(reviewsByCard.get(c.id));
      if (s === "new") nb.push(c);
      else if (s === "learning") lb.push(c);
      else mb.push(c);
    }
    return { newCards: nb, learningCards: lb, masteredCards: mb };
  }, [cards, reviewsByCard]);

  const filteredCards =
    filter === "new"
      ? newCards
      : filter === "learning"
        ? learningCards
        : filter === "mastered"
          ? masteredCards
          : cards;

  // Today's queue count (client-side so the local calendar wins).
  // Rule: due cards up to MAX_SESSION, plus new cards up to
  // NEW_CARDS_PER_DAY minus review rows created today for this deck.
  const today = localISODate();
  const dueCount = reviews.filter((r) => r.due_date <= today).length;
  const rowsCreatedToday = reviews.filter(
    (r) => localISODate(new Date(r.created_at)) === today
  ).length;
  const newSlotsLeft = Math.max(0, NEW_CARDS_PER_DAY - rowsCreatedToday);
  const newInQueue = Math.min(newCards.length, newSlotsLeft);
  const queueCount = Math.min(MAX_SESSION, dueCount + newInQueue);

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
          <div className="mt-0.5 text-xs text-muted">
            {cards.length} card{cards.length === 1 ? "" : "s"} total
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
        <DeckActionsMenu
          label="Deck actions"
          onDelete={() => setDeletingDeck(true)}
        />
      </div>

      <EditDeckModal
        open={editing}
        onClose={() => setEditing(false)}
        deck={deck}
      />

      <DeleteDeckModal
        open={deletingDeck}
        deck={deck}
        cardCount={cards.length}
        onClose={() => setDeletingDeck(false)}
        onDeleted={async () => {
          setDeletingDeck(false);
          await revalidateDecksList();
          router.push("/reviews");
        }}
      />

      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        tone="success"
      />

      {/* ── Session CTAs ─────────────────────────────────────────── */}
      {cards.length > 0 && !showAdd && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {queueCount > 0 ? (
              <Link
                href={`/reviews/decks/${deck.id}/session`}
                className="btn-primary px-4 py-2 text-sm"
              >
                Review today · {queueCount}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-xl bg-soft px-3 py-2 text-xs font-semibold text-muted">
                Nothing to review today
              </span>
            )}
            <Link
              href={`/reviews/decks/${deck.id}/review`}
              className="btn-outline px-4 py-2 text-sm"
            >
              Study all
            </Link>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="btn-ghost px-3 py-2 text-sm"
            >
              + Add card
            </button>
          </div>
        </div>
      )}

      {/* ── Add / edit card flow (inline expansion) ────────────────
          Same component in both roles — edit mode is triggered by
          the pencil next to any card row and pre-fills the fields.
          After edit save, the parent closes the form (`setEditingCard(null)`);
          after add save, the form stays open and resets to let the
          user chain more adds. */}
      {(showAdd || editingCard) && (
        <div className="mb-6">
          <AddCardForm
            deckId={deck.id}
            userId={userId}
            existingCard={editingCard ?? undefined}
            onCancel={() => {
              setShowAdd(false);
              setEditingCard(null);
            }}
            onAdded={(card) => {
              setCards((c) => [card, ...c]);
              setToast("Card added");
            }}
            onEdited={(card) => {
              setCards((c) =>
                c.map((x) => (x.id === card.id ? card : x))
              );
              setEditingCard(null);
              setToast("Card updated");
            }}
            autoFocus
          />
        </div>
      )}

      {/* ── Filter chips ─────────────────────────────────────────── */}
      {cards.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            count={cards.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterChip
            label="New"
            count={newCards.length}
            active={filter === "new"}
            onClick={() => setFilter("new")}
          />
          <FilterChip
            label="Learning"
            count={learningCards.length}
            active={filter === "learning"}
            onClick={() => setFilter("learning")}
          />
          <FilterChip
            label="Mastered"
            count={masteredCards.length}
            active={filter === "mastered"}
            onClick={() => setFilter("mastered")}
          />
        </div>
      )}

      {/* ── Card list (bordered rows) ────────────────────────────── */}
      <CardList
        cards={filteredCards}
        reviewsByCard={reviewsByCard}
        onEdit={(card) => {
          // Close any add-mode expansion, open edit-mode with this
          // card pre-filled. Scroll up so the form is visible.
          setShowAdd(false);
          setEditingCard(card);
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
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
            setToast("Card deleted");
          }
        }}
      />
    </div>
  );
}

// =============================================================
// Filter chip — reused visual for the state pills' little cousin.
// =============================================================
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? "bg-primary text-white shadow-soft"
          : "bg-soft text-primary hover:bg-primary-50"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-[10px] font-bold ${
          active ? "bg-white/20 text-white" : "bg-white text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// =============================================================
// Card list + card row
// =============================================================
function CardList({
  cards,
  reviewsByCard,
  onEdit,
  onDelete,
}: {
  cards: CustomCard[];
  reviewsByCard: Map<string, CustomCardReview>;
  onEdit: (card: CustomCard) => void;
  onDelete: (id: string) => void;
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white/60 p-6 text-center text-sm text-muted">
        No cards in this view.
      </div>
    );
  }

  // Bordered list — spec calls for rows, not rounded card tiles. One
  // outer border, `divide-y` between rows, no per-row shadow.
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
      {cards.map((c) => {
        const review = reviewsByCard.get(c.id);
        const state = derivedState(review);
        const leech = isLeech(review);
        return (
          <li
            key={c.id}
            className="flex items-start justify-between gap-3 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="jp text-lg text-ink">{c.reading}</span>
                {c.kanji && (
                  <span className="jp text-base text-muted">{c.kanji}</span>
                )}
                {leech && (
                  <span
                    title="Frequent lapses — consider adding a mnemonic note"
                    className="rounded-full border border-border bg-white px-2 py-[1px] text-[10px] font-semibold text-muted"
                  >
                    hard
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-ink">{c.meaning_en}</div>
              {c.note && (
                <div className="mt-1 text-xs italic text-muted">{c.note}</div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <StatePill state={state} />
              <button
                type="button"
                onClick={() => onEdit(c)}
                aria-label="Edit card"
                title="Edit card"
                className="rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-primary"
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
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                aria-label="Delete card"
                title="Delete card"
                className="rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-red-600"
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// =============================================================
// State pill — three tones drawn from existing tokens.
//   * new      — neutral outline pill
//   * learning — warm-accent tinted
//   * mastered — success-green tinted
// The box number itself is never surfaced to the user.
// =============================================================
function StatePill({ state }: { state: ReviewState }) {
  if (state === "new") {
    return (
      <span className="rounded-full border border-border bg-white px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-muted">
        New
      </span>
    );
  }
  if (state === "learning") {
    return (
      <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-accent-700">
        Learning
      </span>
    );
  }
  return (
    <span className="rounded-full border border-success/30 bg-success-50 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-success-700">
      Mastered
    </span>
  );
}

// (Old inline DeleteDeckButton removed — deck deletion is handled
// by the "..." menu in the deck header plus <DeleteDeckModal>.)
