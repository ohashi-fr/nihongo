"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";

/**
 * Flip-flashcard review flow for user-authored custom decks.
 *
 * Fixed direction: JP → EN. The front shows the hiragana reading big
 * with the kanji as a secondary line (when present); the back shows
 * the English meaning and any personal note. No favorite star — the
 * card is *already* saved into the deck, so a star would be
 * redundant.
 *
 * Same visual + keyboard patterns as VerbFlashcardClient etc. so it
 * feels native to anyone already using the seeded flashcards.
 */

type Props = {
  deck: CustomDeck;
  cards: CustomCard[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CustomDeckReviewClient({ deck, cards }: Props) {
  const [shuffleOn, setShuffleOn] = useState(false);
  const [seed, setSeed] = useState(0);

  const order: CustomCard[] = useMemo(() => {
    return shuffleOn ? shuffle(cards) : cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, shuffleOn, seed]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Reset position when the queue is rebuilt.
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [order]);

  function prev() {
    if (index === 0) return;
    setFlipped(false);
    setIndex((i) => i - 1);
  }

  function next() {
    if (index >= order.length - 1) return;
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  // Keyboard nav — Space / Enter flip, ← / → navigate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, order.length]);

  if (order.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-sm text-muted">
        This deck has no cards yet.{" "}
        <Link
          href={`/reviews/decks/${deck.id}`}
          className="text-ink underline underline-offset-2"
        >
          Add some →
        </Link>
      </div>
    );
  }

  const card = order[index];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          {index + 1} / {order.length}
        </span>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={shuffleOn}
            onChange={() => {
              setShuffleOn((s) => !s);
              setSeed((s) => s + 1);
            }}
            className="h-4 w-4 rounded border-border accent-ink"
          />
          <span>Shuffle</span>
        </label>
      </div>

      <div
        className="relative mx-auto"
        style={{ perspective: "1200px", maxWidth: "560px" }}
      >
        <button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          aria-label="Flip card"
          className="relative block w-full text-left"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.55s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "420px",
          }}
        >
          {/* Front — Japanese */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="jp text-center text-5xl leading-tight text-ink">
              {card.reading}
            </div>
            {card.kanji && (
              <div className="jp mt-3 text-center text-2xl text-muted">
                {card.kanji}
              </div>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              Japanese
            </div>
          </div>

          {/* Back — English + note */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-paper p-8 shadow-card"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center text-2xl font-medium text-ink">
              {card.meaning_en}
            </div>
            {card.note && (
              <div className="mt-4 max-w-full text-center text-sm italic text-muted">
                {card.note}
              </div>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              English
            </div>
          </div>
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-muted">
        Tap the card to flip · ← / → to navigate
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="btn-outline disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          disabled={index >= order.length - 1}
          className="btn-primary disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/reviews/decks/${deck.id}`}
          className="text-sm text-muted hover:text-ink"
        >
          ← Back to deck
        </Link>
      </div>
    </div>
  );
}
