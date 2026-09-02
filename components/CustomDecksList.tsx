"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CreateDeckModal from "@/components/CreateDeckModal";
import DeleteDeckModal from "@/components/DeleteDeckModal";
import EmptyDeckModal from "@/components/EmptyDeckModal";
import DeckActionsMenu from "@/components/DeckActionsMenu";
import Toast from "@/components/ui/Toast";
import { illustrationUrl } from "@/lib/deckIllustrations";
import { createClient } from "@/lib/supabase/client";
import { revalidateDecksList } from "@/app/reviews/actions";
import type { CustomDeckWithCount } from "@/lib/customDecks";

/**
 * "My custom decks" section on /reviews. Deck cards match the visual
 * weight of the Vocabulary + Kanji Favorites blocks — same padding,
 * radius, shadow, and an illustration top-right. The primary
 * affordance to add a new deck is a translucent dashed *card* in the
 * same grid, not a top-corner button, so the "add one here" hint
 * stays visible inline with the collection.
 *
 * Each deck card carries a discreet "⋯" menu (via <DeckActionsMenu>)
 * with "Empty deck" (clears its cards, keeps the deck) and "Delete
 * deck" (removes it entirely); confirmation happens through
 * <EmptyDeckModal> / <DeleteDeckModal>. On success the local list
 * updates and a toast confirms.
 */

type Props = {
  decks: CustomDeckWithCount[];
  userId: string;
};

export default function CustomDecksList({ decks, userId }: Props) {
  const [creating, setCreating] = useState(false);
  const [visibleDecks, setVisibleDecks] =
    useState<CustomDeckWithCount[]>(decks);
  const [deletingDeck, setDeletingDeck] =
    useState<CustomDeckWithCount | null>(null);
  const [emptyingDeck, setEmptyingDeck] =
    useState<CustomDeckWithCount | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section className="mt-2">
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-ink">
          My custom decks
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Personal decks you&apos;ve built from the dictionary.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visibleDecks.map((d) => (
          <DeckCard
            key={d.id}
            deck={d}
            onRequestEmpty={() => setEmptyingDeck(d)}
            onRequestDelete={() => setDeletingDeck(d)}
          />
        ))}

        {/* Translucent "add a deck here" placeholder — same footprint
            as the real cards so the grid stays visually balanced. */}
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="group flex min-h-[184px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white/40 p-6 text-muted transition hover:border-accent hover:bg-accent/5 hover:text-primary"
        >
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-semibold text-accent shadow-soft transition group-hover:bg-accent group-hover:text-white"
          >
            +
          </span>
          <span className="text-sm font-semibold">New deck</span>
          <span className="text-xs">Give it a name and an illustration</span>
        </button>
      </div>

      <CreateDeckModal
        open={creating}
        onClose={() => setCreating(false)}
        userId={userId}
      />

      <DeleteDeckModal
        open={deletingDeck !== null}
        deck={deletingDeck}
        cardCount={deletingDeck?.card_count ?? 0}
        onClose={() => setDeletingDeck(null)}
        onDeleted={async () => {
          const name = deletingDeck?.name;
          if (deletingDeck) {
            setVisibleDecks((prev) =>
              prev.filter((d) => d.id !== deletingDeck.id)
            );
          }
          setDeletingDeck(null);
          await revalidateDecksList();
          setToast(name ? `"${name}" deleted` : "Deck deleted");
        }}
      />

      <EmptyDeckModal
        open={emptyingDeck !== null}
        deckName={emptyingDeck?.name ?? null}
        cardCount={emptyingDeck?.card_count ?? 0}
        onClose={() => setEmptyingDeck(null)}
        onConfirm={async () => {
          if (!emptyingDeck) return;
          const supabase = createClient();
          const { error } = await supabase
            .from("custom_cards")
            .delete()
            .eq("deck_id", emptyingDeck.id);
          if (error) {
            // eslint-disable-next-line no-console
            console.error("[custom_cards] empty deck failed:", error);
            return (
              `${error.code ? `[${error.code}] ` : ""}${error.message}` +
              (error.hint ? ` — ${error.hint}` : "")
            );
          }
        }}
        onEmptied={async () => {
          const name = emptyingDeck?.name;
          if (emptyingDeck) {
            setVisibleDecks((prev) =>
              prev.map((d) =>
                d.id === emptyingDeck.id ? { ...d, card_count: 0 } : d
              )
            );
          }
          setEmptyingDeck(null);
          await revalidateDecksList();
          setToast(name ? `"${name}" emptied` : "Deck emptied");
        }}
      />

      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        tone="success"
      />
    </section>
  );
}

// =============================================================
// Single deck card — mirrors VocabDeckCard / KanjiDeckCard shape.
// Wraps a <Link> to the deck detail; the "⋯" menu sits in the top-
// right corner and stops event propagation so tapping it doesn't
// also fire the Link navigation.
// =============================================================
function DeckCard({
  deck,
  onRequestEmpty,
  onRequestDelete,
}: {
  deck: CustomDeckWithCount;
  onRequestEmpty: () => void;
  onRequestDelete: () => void;
}) {
  const empty = deck.card_count === 0;
  return (
    <div className="relative">
      <Link
        href={`/reviews/decks/${deck.id}`}
        className="group block rounded-2xl bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-ink">
              {deck.name}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Custom deck
            </p>
          </div>
          <Image
            src={illustrationUrl(deck.illustration)}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 object-contain drop-shadow-sm"
          />
        </div>

        <p className="mt-4 text-2xl font-semibold">
          {deck.card_count} {deck.card_count === 1 ? "card" : "cards"} saved
        </p>
        {empty && (
          <p className="mt-1 text-xs text-muted">
            No cards yet — tap to add your first.
          </p>
        )}

        <div className="btn-primary mt-4 w-full justify-center transition group-hover:brightness-105">
          Open →
        </div>
      </Link>

      {/* Actions menu — floats over the Link, but stops event
          propagation so tapping it doesn't navigate. */}
      <div className="absolute right-2 top-2">
        <DeckActionsMenu
          label={`Actions for ${deck.name}`}
          items={[
            { label: "Empty deck", onClick: onRequestEmpty },
            { label: "Delete deck", tone: "danger", onClick: onRequestDelete },
          ]}
        />
      </div>
    </div>
  );
}
