"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CreateDeckModal from "@/components/CreateDeckModal";
import { illustrationUrl } from "@/lib/deckIllustrations";
import type { CustomDeckWithCount } from "@/lib/customDecks";

/**
 * "My custom decks" section on /reviews. Deck cards match the visual
 * weight of the Vocabulary + Kanji Favorites blocks — same padding,
 * radius, shadow, and an illustration top-right. The primary
 * affordance to add a new deck is a translucent dashed *card* in the
 * same grid, not a top-corner button, so the "add one here" hint
 * stays visible inline with the collection.
 */

type Props = {
  decks: CustomDeckWithCount[];
  userId: string;
};

export default function CustomDecksList({ decks, userId }: Props) {
  const [creating, setCreating] = useState(false);

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
        {decks.map((d) => (
          <DeckCard key={d.id} deck={d} />
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
    </section>
  );
}

// =============================================================
// Single deck card — mirrors VocabDeckCard / KanjiDeckCard shape.
// =============================================================
function DeckCard({ deck }: { deck: CustomDeckWithCount }) {
  const empty = deck.card_count === 0;
  return (
    <Link
      href={`/reviews/decks/${deck.id}`}
      className="group block rounded-2xl bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-ink">{deck.name}</h3>
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
  );
}
