"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateDeck } from "@/app/reviews/actions";
import ProgressBar from "@/components/ui/ProgressBar";
import ExampleBlock from "@/components/ExampleBlock";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";
import {
  BOX_INTERVALS,
  MAX_SESSION,
  NEW_CARDS_PER_DAY,
  addDaysISO,
  localISODate,
  nextBoxOnKnow,
  type CustomCardReview,
  type LeitnerBox,
} from "@/lib/leitner";

/**
 * Leitner daily review session for a custom deck.
 *
 * Single source of truth: `queue` is the list of cards remaining
 * to see, current one at head. Everything else is derived:
 *
 *   isComplete = queue.length === 0
 *
 * "I know it": pop the head, persist (schedules by box interval).
 * "Review again": pop the head, persist (schedules for tomorrow).
 *
 * Neither rating re-enqueues the card. "Review again" was
 * originally re-queued once as a Leitner second-pass, but that
 * made the end of session confusing — the same card looked like
 * it re-appeared as a bug. Now every rating removes the card
 * from the current session; the "again" card comes back naturally
 * at the next session (its due_date is tomorrow).
 *
 * Persistence is fire-and-await in the background (optimistic UI
 * up front). Failures surface via `writeError` and a red banner.
 */

type Props = {
  deck: CustomDeck;
  cards: CustomCard[];
  initialReviews: CustomCardReview[];
  userId: string;
};

type SessionItem = {
  card: CustomCard;
  /** Current review row for this card, or null if never rated. */
  review: CustomCardReview | null;
};

export default function CustomDeckSessionClient({
  deck,
  cards,
  initialReviews,
  userId,
}: Props) {
  const router = useRouter();

  // ── Build the queue exactly once ─────────────────────────────────
  //   Rebuilds if the underlying props ever change identity, but
  //   that value is only ever *consumed* as the initial state for
  //   `queue` below — so the rebuild has no user-visible effect
  //   during a running session.
  const initialQueue = useMemo(() => {
    const today = localISODate();
    const cardById = new Map(cards.map((c) => [c.id, c]));
    const reviewsByCard = new Map(
      initialReviews.map((r) => [r.custom_card_id, r])
    );
    const rowsCreatedToday = initialReviews.filter(
      (r) => localISODate(new Date(r.created_at)) === today
    ).length;

    const dueItems: SessionItem[] = initialReviews
      .filter((r) => r.due_date <= today && cardById.has(r.custom_card_id))
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, MAX_SESSION)
      .map((r) => ({
        card: cardById.get(r.custom_card_id)!,
        review: r,
      }));

    const budgetLeft = Math.max(0, MAX_SESSION - dueItems.length);
    const newSlots = Math.max(0, NEW_CARDS_PER_DAY - rowsCreatedToday);
    const limit = Math.min(newSlots, budgetLeft);

    const newItems: SessionItem[] = cards
      .filter((c) => !reviewsByCard.has(c.id))
      .slice(0, limit)
      .map((c) => ({ card: c, review: null }));

    return shuffle([...dueItems, ...newItems]);
  }, [cards, initialReviews]);

  // Single source of truth — the cards still to review.
  // Current card is always queue[0].
  const [queue, setQueue] = useState<SessionItem[]>(initialQueue);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  // Surface for write failures — set once and left up. If it lights,
  // ratings are running visually but NOT persisting to the DB.
  const [writeError, setWriteError] = useState<string | null>(null);

  // Session size snapshot for the ProgressBar total. Captured ONCE
  // at first render so a mid-session prop refresh can't shrink it.
  const [initialQueueSize] = useState(() => initialQueue.length);

  // ── Derived, never stored ────────────────────────────────────────
  const isComplete = queue.length === 0;
  const current = queue[0]; // undefined when isComplete

  // ── The one and only handler ─────────────────────────────────────
  //   Both ratings do the same shape:
  //     1. Read `queue` ONCE at the top.
  //     2. nextQueue = queue.slice(1)    (always pop the head)
  //     3. setQueue(nextQueue) inside flushSync so React commits
  //        immediately — no batch scheduling can push the render
  //        onto the next tick.
  //     4. Persist to Supabase in the background.
  //   When nextQueue is empty, the next render shows the end screen
  //   automatically.
  async function rate(rating: "known" | "again") {
    const head = queue[0];
    if (!head) return; // safety only; we're already isComplete

    // ── Compute the review payload ───────────────────────────────
    const existing = head.review;
    const currentBox: LeitnerBox = (existing?.box ?? 1) as LeitnerBox;
    const newBox: LeitnerBox =
      rating === "known" ? nextBoxOnKnow(currentBox) : (1 as LeitnerBox);
    const days = rating === "known" ? BOX_INTERVALS[newBox] : 1;
    const nowIso = new Date().toISOString();
    const newDueDate = addDaysISO(localISODate(), days);
    const newLapses =
      (existing?.lapses ?? 0) + (rating === "again" ? 1 : 0);

    // Always pop the head — no re-queue, no retry pass. The
    // rating just schedules the card (tomorrow for "again",
    // BOX_INTERVALS[newBox] days for "known") and the card leaves
    // the current session immediately.
    const nextQueue: SessionItem[] = queue.slice(1);

    // TEMP debug — prove the queue drops to 0 on the right click.
    // Safe to remove once verified.
    // eslint-disable-next-line no-console
    console.log(
      `[session] queue ${queue.length} -> ${nextQueue.length}  (${rating})`
    );

    // ── One mutation, forced sync commit ─────────────────────────
    //   `flushSync` makes React commit these state updates
    //   *immediately*, before the browser paints again. That
    //   eliminates any lingering "the queue updated but the render
    //   is deferred for one more tick" edge case — which is the
    //   only remaining explanation for the double-click symptom
    //   after removing every ref / index / latch that could have
    //   held a stale value.
    flushSync(() => {
      setQueue(nextQueue);
      setFlipped(false);
      if (rating === "known") {
        setKnownCount((n) => n + 1);
      } else {
        setAgainCount((n) => n + 1);
      }
    });

    // ── Persist in background — errors surface, session survives ─
    const payload = {
      user_id: userId,
      custom_card_id: head.card.id,
      box: newBox,
      due_date: newDueDate,
      last_reviewed_at: nowIso,
      lapses: newLapses,
    };
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("custom_card_reviews")
        .upsert(payload, { onConflict: "user_id,custom_card_id" });
      if (error) {
        // eslint-disable-next-line no-console
        console.error(
          "[custom_card_reviews] upsert failed:",
          error,
          "\npayload:",
          payload
        );
        setWriteError(
          `${error.code ? `[${error.code}] ` : ""}${error.message}` +
            (error.hint ? ` — ${error.hint}` : "")
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(
        "[custom_card_reviews] upsert threw:",
        e,
        "\npayload:",
        payload
      );
      setWriteError(
        e instanceof Error ? e.message : "Network error while saving review"
      );
    }
  }

  // ── Keyboard: Space/Enter flip, J = known, A = again ─────────────
  // Ref shim so the keyboard handler installed at mount always
  // reads the latest `rate` (which closes over the latest queue).
  const rateRef = useRef(rate);
  rateRef.current = rate;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "j" || e.key === "J" || e.key === "1") {
        void rateRef.current("known");
      } else if (e.key === "a" || e.key === "A" || e.key === "2") {
        void rateRef.current("again");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Revalidation — cover every exit path ────────────────────────
  //   The deck-detail page ("X to review") is cached in the client
  //   router cache. It has to be invalidated whenever the user
  //   leaves the session, otherwise they see the pre-session count
  //   even though every card was just rated. We hit that from:
  //
  //     * session naturally completes → effect below fires once
  //       (guarded by a ref)
  //     * user clicks "Back to deck" on the end screen
  //     * user clicks "Exit session" at the bottom
  //
  //   All three routes await `revalidateDeck(deck.id)` before
  //   navigating so the destination render is fresh.
  const revalidatedRef = useRef(false);
  useEffect(() => {
    if (isComplete && !revalidatedRef.current) {
      revalidatedRef.current = true;
      void revalidateDeck(deck.id);
    }
  }, [isComplete, deck.id]);

  async function goToDeck() {
    // Awaited so the destination sees fresh RSC. If already fired
    // by the effect above, this second call is a cheap no-op.
    await revalidateDeck(deck.id);
    router.push(`/reviews/decks/${deck.id}`);
  }

  // ── Render ───────────────────────────────────────────────────────
  //
  // Ordering:
  //   1. Empty at mount → "Nothing to review today" (user arrived
  //      with a clean plate).
  //   2. Complete after having done work → "Session complete".
  //   3. Otherwise → running session.
  //
  // Both branches (1) and (2) hit isComplete === true, but they
  // differ by whether we ever *had* cards. `initialQueueSize` is
  // captured once at mount and can't change.

  if (isComplete && initialQueueSize === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white/60 p-8 text-center">
        <div className="jp text-4xl leading-none">お疲れ様</div>
        <p className="mt-3 text-sm font-medium text-ink">
          Nothing to review today
        </p>
        <p className="mt-1 text-xs text-muted">
          Come back tomorrow, or study the full deck freely.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href={`/reviews/decks/${deck.id}`}
            className="btn-outline px-3 py-1.5 text-sm"
          >
            Back to deck
          </Link>
          <Link
            href={`/reviews/decks/${deck.id}/review`}
            className="btn-primary px-3 py-1.5 text-sm"
          >
            Study all →
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="space-y-4">
        {writeError && <WriteErrorBanner message={writeError} />}
        <div className="rounded-lg border border-border bg-white p-8 text-center shadow-card">
          <div className="jp text-4xl leading-none">完了</div>
          <p className="mt-3 text-lg font-bold text-ink">Session complete</p>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-success-700">
              {knownCount} mastered today
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-accent-700">
              {againCount} to revisit
            </span>
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => void goToDeck()}
              className="btn-primary px-4 py-2 text-sm"
            >
              Back to deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Running session — `current` is defined because !isComplete.
  const kanaOnly = current!.card.reading === current!.card.kanji;
  const ratedSoFar = knownCount + againCount;
  const progressFraction =
    initialQueueSize > 0 ? Math.min(1, ratedSoFar / initialQueueSize) : 0;

  return (
    <div>
      {writeError && (
        <div className="mb-4">
          <WriteErrorBanner message={writeError} />
        </div>
      )}
      <div className="mb-4">
        <ProgressBar
          value={progressFraction}
          label={`${Math.min(ratedSoFar + 1, initialQueueSize)} / ${initialQueueSize}`}
        />
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
              {current!.card.reading}
            </div>
            {current!.card.kanji && !kanaOnly && (
              <div className="jp mt-3 text-center text-2xl text-muted">
                {current!.card.kanji}
              </div>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              Tap to reveal
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
              {current!.card.meaning_en}
            </div>
            {current!.card.note && (
              <div className="mt-4 max-w-full text-center text-sm italic text-muted">
                {current!.card.note}
              </div>
            )}
            {current!.card.example_jp && (
              <div className="mt-4 w-full max-w-full">
                <ExampleBlock
                  example={{
                    jp: current!.card.example_jp,
                    en: current!.card.example_en,
                    reading: current!.card.example_reading,
                    source:
                      current!.card.example_source ??
                      "Tatoeba (CC-BY 2.0 FR)",
                  }}
                />
              </div>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              How did you do?
            </div>
          </div>
        </button>
      </div>

      {/* Rating actions — always active. */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void rate("again")}
          className="rounded-xl border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent-700 shadow-soft transition hover:bg-accent/20"
        >
          Review again
        </button>
        <button
          type="button"
          onClick={() => void rate("known")}
          className="rounded-xl border border-success/40 bg-success-50 px-5 py-2.5 text-sm font-semibold text-success-700 shadow-soft transition hover:bg-success/10"
        >
          I know it
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-muted">
        Tap the card to flip · J = know · A = again
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => void goToDeck()}
          className="text-sm text-muted hover:text-ink"
        >
          Exit session
        </button>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sticky-at-top red banner shown when at least one rating in the
 * session failed to persist. Intentionally loud — this is the
 * signal that the session "worked" visually but nothing landed in
 * the DB (missing table, RLS, network).
 */
function WriteErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800"
    >
      <div className="font-semibold">Ratings are NOT being saved.</div>
      <div className="mt-1 leading-snug">{message}</div>
      <div className="mt-1 text-red-700">
        Check the browser console for the exact payload and Postgres
        error code. Common cause: the <code>custom_card_reviews</code>{" "}
        migration hasn&apos;t been applied to this Supabase project yet.
      </div>
    </div>
  );
}
