"use client";

import { useEffect, useState } from "react";
import type { KanjiFields } from "@/components/KanjiQuizClient";
import { formatKunyomi } from "@/lib/kanjiReadings";
import { createClient } from "@/lib/supabase/client";
import FavoriteStar from "@/components/FavoriteStar";

// FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
// repetition later. The card_reviews table is still in the schema.

type Props = {
  cards: { id: string; fields: KanjiFields }[];
};

function shuffleArr<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Study mode — flip-card browser. No scoring, no session saved.
 * Order defaults to level order; can be shuffled via a toggle.
 * Keyboard ← / → also navigate.
 */
export default function KanjiStudyCard({ cards }: Props) {
  const [shuffleOn, setShuffleOn] = useState(false);
  const [order, setOrder] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Auth + favorites (replaces the FSRS reviews state).
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUserId(user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setFavorites(new Set());
      return;
    }
    const supabase = createClient();
    const ids = cards.map((c) => c.id);
    if (ids.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("favorites")
        .select("card_id")
        .eq("user_id", userId)
        .in("card_id", ids);
      if (cancelled) return;
      setFavorites(new Set((data ?? []).map((r: any) => r.card_id as string)));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, cards]);

  async function toggleFavorite(cardId: string) {
    if (!userId) {
      // eslint-disable-next-line no-console
      console.warn("[favorites] no userId — star noop");
      return;
    }
    const isFav = favorites.has(cardId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(cardId);
      else next.add(cardId);
      return next;
    });

    const supabase = createClient();

    // TEMP DEBUG — confirm the browser client actually has a session.
    const { data: sessionData } = await supabase.auth.getSession();
    // eslint-disable-next-line no-console
    console.log("[favorites] session check:", {
      authedUserId: sessionData?.session?.user?.id ?? null,
      propUserId: userId,
      cardId,
      action: isFav ? "delete" : "insert",
    });

    if (isFav) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("card_id", cardId);
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[favorites] delete failed:", error);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.add(cardId);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, card_id: cardId });
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[favorites] insert failed:", error);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
      }
    }
  }

  // Toggling shuffle reshuffles the order and resets back to the start.
  function toggleShuffle() {
    const next = !shuffleOn;
    setShuffleOn(next);
    setOrder(next ? shuffleArr(cards) : cards);
    setIndex(0);
    setFlipped(false);
  }

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

  // FSRS rating logic removed — see lib/fsrs.ts to re-enable spaced
  // repetition later.

  // Keyboard navigation.
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

  const card = order[index];
  if (!card) return null;
  const f = card.fields;

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
            onChange={toggleShuffle}
            className="h-4 w-4 rounded border-border accent-ink"
          />
          <span>Shuffle</span>
        </label>
      </div>

      {/* Flip card */}
      <div
        className="relative mx-auto"
        style={{ perspective: "1200px", maxWidth: "560px" }}
      >
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label="Flip card"
          className="relative block w-full text-left"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.55s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "420px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg border border-border bg-white shadow-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="jp text-[180px] leading-none">{f.kanji}</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-6 shadow-card"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-baseline gap-3">
              <span className="jp text-4xl">{f.kanji}</span>
              <span className="text-sm font-medium uppercase tracking-wide text-muted">
                {f.meanings.join(", ")}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {f.kunyomi.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-muted">
                    Kun&apos;yomi
                  </span>
                  <div className="jp text-lg">
                    {f.kunyomi.map(formatKunyomi).join("、")}
                  </div>
                </div>
              )}
              {f.onyomi.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-muted">
                    On&apos;yomi
                  </span>
                  <div className="jp text-lg">{f.onyomi.join("、")}</div>
                </div>
              )}
            </div>

            {f.examples.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-muted">
                  Examples
                </div>
                <ul className="mt-1 space-y-1 text-sm">
                  {f.examples.map((ex, i) => (
                    <li key={i}>
                      <span className="jp">{ex.word}</span>
                      <span className="jp ml-2 text-muted">({ex.reading})</span>
                      <span className="ml-2 text-muted">— {ex.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </button>

        {/* Favorite star — top-right of the card, above the flip button */}
        <div className="absolute right-2 top-2 z-10">
          <FavoriteStar
            isFavorite={favorites.has(card.id)}
            onToggle={() => toggleFavorite(card.id)}
            loggedIn={Boolean(userId)}
          />
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-muted">
        Tap the card to flip · ← / → to navigate
      </div>

      <div className="mt-6 flex justify-center gap-3">
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

      {/* FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
          repetition later. Favoriting is handled by the star button on
          the card itself. */}
    </div>
  );
}

// FSRS RatingButton removed — see lib/fsrs.ts to re-enable spaced
// repetition later.
