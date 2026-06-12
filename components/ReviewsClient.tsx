"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { VerbFields } from "@/components/VerbFlashcardClient";
import type { KanjiFields } from "@/components/KanjiQuizClient";
import { deriveHiragana } from "@/lib/verbReadings";
import { formatKunyomi } from "@/lib/kanjiReadings";
import FavoriteStar from "@/components/FavoriteStar";

// FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
// repetition later. This client now drives a manual "favorites" deck.

export type VerbFavoriteItem = {
  cardId: string;
  fields: VerbFields;
};

export type KanjiFavoriteItem = {
  cardId: string;
  fields: KanjiFields;
};

type Deck = "verb" | "kanji";

type Phase =
  | { kind: "ready" }
  | { kind: "playing"; deck: Deck };

type Props = {
  verbItems: VerbFavoriteItem[];
  kanjiItems: KanjiFavoriteItem[];
  userId: string;
};

export default function ReviewsClient({
  verbItems,
  kanjiItems,
  userId,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: "ready" });
  const [verbQueue, setVerbQueue] = useState<VerbFavoriteItem[]>(() =>
    verbItems.slice()
  );
  const [kanjiQueue, setKanjiQueue] = useState<KanjiFavoriteItem[]>(() =>
    kanjiItems.slice()
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Re-seed queues if the server payload changes (page refresh).
  useEffect(() => {
    setVerbQueue(verbItems.slice());
    setKanjiQueue(kanjiItems.slice());
    setPhase({ kind: "ready" });
    setIndex(0);
    setFlipped(false);
  }, [verbItems, kanjiItems]);

  // Keyboard — Space / Enter flip, ← / → navigate.
  useEffect(() => {
    if (phase.kind !== "playing") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.kind, index, verbQueue.length, kanjiQueue.length]);

  function startDeck(deck: Deck) {
    setIndex(0);
    setFlipped(false);
    setPhase({ kind: "playing", deck });
  }

  function prev() {
    if (index === 0) return;
    setFlipped(false);
    setIndex((i) => i - 1);
  }

  function next() {
    if (phase.kind !== "playing") return;
    const len = phase.deck === "verb" ? verbQueue.length : kanjiQueue.length;
    if (index >= len - 1) return;
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  async function unfavorite(cardId: string) {
    // Persist — with error logging so failures aren't silent.
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    // eslint-disable-next-line no-console
    console.log("[favorites] unstar session check:", {
      authedUserId: sessionData?.session?.user?.id ?? null,
      propUserId: userId,
      cardId,
    });
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("card_id", cardId);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[favorites] delete failed:", error);
    }

    // Optimistically drop from whichever queue holds it.
    if (phase.kind !== "playing") {
      setVerbQueue((q) => q.filter((it) => it.cardId !== cardId));
      setKanjiQueue((q) => q.filter((it) => it.cardId !== cardId));
      return;
    }
    if (phase.deck === "verb") {
      setVerbQueue((q) => {
        const next = q.filter((it) => it.cardId !== cardId);
        if (next.length === 0) {
          setPhase({ kind: "ready" });
        } else if (index >= next.length) {
          setIndex(next.length - 1);
        }
        setFlipped(false);
        return next;
      });
    } else {
      setKanjiQueue((q) => {
        const next = q.filter((it) => it.cardId !== cardId);
        if (next.length === 0) {
          setPhase({ kind: "ready" });
        } else if (index >= next.length) {
          setIndex(next.length - 1);
        }
        setFlipped(false);
        return next;
      });
    }
  }

  // ─── Ready / empty ─────────────────────────────────────────────
  if (phase.kind === "ready") {
    const total = verbQueue.length + kanjiQueue.length;
    if (total === 0) {
      return (
        <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-card">
          <div className="jp text-5xl">完了</div>
          <h2 className="mt-4 text-2xl font-semibold">All caught up! 🎉</h2>
          <p className="mt-2 text-muted">
            No cards saved yet. Tap the{" "}
            <span className="text-[#eab308]">☆</span> on any card to add it
            here.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/modules/vocabulary" className="btn-outline">
              Vocabulary
            </Link>
            <Link href="/modules/kanji" className="btn-outline">
              Kanji
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DeckCard
          title="Vocabulary"
          subtitle="Saved verb cards"
          count={verbQueue.length}
          emptyHint='Star a verb to add it here.'
          onStart={() => startDeck("verb")}
        />
        <DeckCard
          title="Kanji"
          subtitle="Saved kanji cards"
          count={kanjiQueue.length}
          emptyHint='Star a kanji to add it here.'
          onStart={() => startDeck("kanji")}
        />
      </div>
    );
  }

  // ─── Playing ───────────────────────────────────────────────────
  const deck = phase.deck;
  const queue = deck === "verb" ? verbQueue : kanjiQueue;
  const item = queue[index];
  if (!item) {
    // Shouldn't happen — guards above clear the queue cleanly. Bail.
    setPhase({ kind: "ready" });
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>
            {index + 1} / {queue.length}
          </span>
          <span className="badge">
            {deck === "verb" ? "Vocabulary" : "Kanji"}
          </span>
        </div>
        <button
          onClick={() => setPhase({ kind: "ready" })}
          className="text-xs hover:text-ink underline-offset-2 hover:underline"
        >
          Exit
        </button>
      </div>

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
          {deck === "verb" ? (
            <VerbCardFaces item={item as VerbFavoriteItem} />
          ) : (
            <KanjiCardFaces item={item as KanjiFavoriteItem} />
          )}
        </button>

        {/* Star — filled, since every card here is a favorite.
            Clicking removes it from the queue and from `favorites`. */}
        <div className="absolute right-2 top-2 z-10">
          <FavoriteStar
            isFavorite={true}
            onToggle={() => unfavorite(item.cardId)}
            loggedIn
          />
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-muted">
        Tap the card to flip · ← / → to navigate · ★ to remove from
        reviews
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
          disabled={index >= queue.length - 1}
          className="btn-primary disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// =============================================================
// Deck-picker card on the Ready screen
// =============================================================
function DeckCard({
  title,
  subtitle,
  count,
  emptyHint,
  onStart,
}: {
  title: string;
  subtitle: string;
  count: number;
  emptyHint: string;
  onStart: () => void;
}) {
  const empty = count === 0;
  return (
    <div className="rounded-lg border border-border bg-white p-6 shadow-card">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted">
        {subtitle}
      </p>
      <p className="mt-4 text-2xl font-semibold">
        {count} {count === 1 ? "card" : "cards"} saved
      </p>
      {empty && (
        <p className="mt-1 text-xs text-muted">{emptyHint}</p>
      )}
      <button
        onClick={onStart}
        disabled={empty}
        className="btn-primary mt-4 w-full disabled:opacity-40"
      >
        Start →
      </button>
    </div>
  );
}

// =============================================================
// Verb card faces — front English, back Japanese details
// =============================================================
function VerbCardFaces({ item }: { item: VerbFavoriteItem }) {
  const f = item.fields;
  return (
    <>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="text-center text-3xl font-medium">
          {f.translation_en}
        </div>
        <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
          English
        </div>
      </div>

      <div
        className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-6 shadow-card"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="jp text-4xl leading-tight">{f.dictionary_form}</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Group {f.group}
              </span>
            </div>
          </div>
          <Row label="Long (masu)" value={deriveHiragana(f.masu_form, f.dictionary_form)} />
          <Row label="Te form" value={deriveHiragana(f.te_form, f.dictionary_form)} />
          <Row label="Ta form" value={deriveHiragana(f.ta_form, f.dictionary_form)} />
          <Row label="Nai form" value={deriveHiragana(f.nai_form, f.dictionary_form)} />
          <Row
            label="Potential"
            value={deriveHiragana(f.potential_form, f.dictionary_form)}
          />
        </div>
      </div>
    </>
  );
}

// =============================================================
// Kanji card faces — front kanji, back meanings + readings
// =============================================================
function KanjiCardFaces({ item }: { item: KanjiFavoriteItem }) {
  const f = item.fields;
  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center rounded-lg border border-border bg-white shadow-card"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="jp text-[180px] leading-none">{f.kanji}</div>
      </div>

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
            {(f.meanings ?? []).join(", ")}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {(f.kunyomi ?? []).length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wide text-muted">
                Kun&apos;yomi
              </span>
              <div className="jp text-lg">
                {(f.kunyomi ?? []).map(formatKunyomi).join("、")}
              </div>
            </div>
          )}
          {(f.onyomi ?? []).length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wide text-muted">
                On&apos;yomi
              </span>
              <div className="jp text-lg">
                {(f.onyomi ?? []).join("、")}
              </div>
            </div>
          )}
        </div>

        {(f.examples ?? []).length > 0 && (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-muted">
              Examples
            </div>
            <ul className="mt-1 space-y-1 text-sm">
              {(f.examples ?? []).map((ex, i) => (
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
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-baseline gap-3 text-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="jp">{value || "—"}</div>
    </div>
  );
}
