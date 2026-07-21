"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Card } from "@/lib/types";
import PreQuizScreen, { type PreQuizMode } from "@/components/PreQuizScreen";
import { createClient } from "@/lib/supabase/client";
import FavoriteStar from "@/components/FavoriteStar";
import ExampleBlock from "@/components/ExampleBlock";
import { parseExample } from "@/lib/exampleSentence";

/**
 * Flip-flashcard client for the "N5 Nouns" module (and any future
 * `card_type === 'noun_flashcard'` cards).
 *
 * Same structural pattern as VerbFlashcardClient / AdjectiveFlashcardClient:
 * PreQuizScreen for direction pick, flip card with three modes
 * (EN→JP / JP→EN / Mix, direction rolled per-card in mix mode),
 * shuffle toggle, keyboard nav, FavoriteStar wired to the shared
 * `favorites` table.
 *
 * Kana-only nouns (パン, コーヒー, etc.) — when `japanese === hiragana`
 * we render only one line on the JP face so the reading doesn't
 * duplicate under itself.
 */

/**
 * NounFields also covers `adverb_flashcard`. Adverbs share the exact
 * same three-slot shape as nouns (japanese / hiragana / english), so
 * we widen the discriminator rather than duplicate a whole new client.
 * The `card_type` is preserved on parse so downstream code (Reviews
 * bucketing, filter pills) can still distinguish them.
 */
export type NounFields = {
  card_type: "noun_flashcard" | "adverb_flashcard";
  japanese: string;
  hiragana: string;
  english: string;
  /** Optional example sentence (populated by the Tatoeba backfill). */
  example?: import("@/lib/exampleSentence").ExampleSentence;
};

type Direction = "en_jp" | "jp_en" | "mix";

type Item = {
  id: string;
  fields: NounFields;
  dir: "en_jp" | "jp_en";
};

type Props = {
  cards: Card[];
  slug: string;
  levelId: string;
  levelName: string;
};

const MODES: PreQuizMode[] = [
  { value: "jp_en", label: "JP → EN" },
  { value: "en_jp", label: "EN → JP" },
  { value: "mix", label: "Mix" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseNounFields(c: Card): NounFields {
  const f = c.fields as any;
  const rawType = f?.card_type;
  // Preserve the discriminator (adverbs run through this parser too)
  // so downstream filters and buckets can tell them apart.
  const cardType: NounFields["card_type"] =
    rawType === "adverb_flashcard" ? "adverb_flashcard" : "noun_flashcard";
  const hiragana = String(f.hiragana ?? "");
  const rawJapanese = String(f.japanese ?? "");
  // Kana-only entries (typically adverbs like ぴったり, or nouns like
  // パン when written from a katakana source) may arrive with an
  // empty `japanese`. Fall back to hiragana so the display always
  // has a primary word, and mark it kana-only by setting the two
  // equal — that's exactly what `isKanaOnly` looks for downstream.
  const japanese = rawJapanese.length > 0 ? rawJapanese : hiragana;
  return {
    card_type: cardType,
    japanese,
    hiragana,
    english: f.english ?? "",
    ...(f.example ? { example: f.example } : {}),
  };
}

/** True when the display form is already the kana reading. */
function isKanaOnly(f: NounFields): boolean {
  return (
    f.japanese.length > 0 &&
    f.hiragana.length > 0 &&
    f.japanese === f.hiragana
  );
}

export default function NounFlashcardClient({
  cards,
  slug,
  levelId,
  levelName,
}: Props) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const direction: Direction | null =
    modeParam === "en_jp" ||
    modeParam === "jp_en" ||
    modeParam === "mix"
      ? modeParam
      : null;

  const parsedCards = useMemo(
    () => cards.map((c) => ({ id: c.id, fields: parseNounFields(c) })),
    [cards]
  );

  const [shuffleOn, setShuffleOn] = useState(false);
  const [seed, setSeed] = useState(0);

  const order: Item[] = useMemo(() => {
    if (!direction) return [];
    const base = shuffleOn ? shuffle(parsedCards) : parsedCards;
    return base.map((c) => ({
      id: c.id,
      fields: c.fields,
      dir:
        direction === "mix"
          ? Math.random() < 0.5
            ? "en_jp"
            : "jp_en"
          : direction,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, parsedCards, shuffleOn, seed]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // ── Auth + favorites (same pattern as the other flashcard clients) ──
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
    const cardIds = parsedCards.map((c) => c.id);
    if (cardIds.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("favorites")
        .select("card_id")
        .eq("user_id", userId)
        .in("card_id", cardIds);
      if (cancelled) return;
      setFavorites(new Set((data ?? []).map((r: any) => r.card_id as string)));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, parsedCards]);

  async function toggleFavorite(cardId: string) {
    if (!userId) return;
    const isFav = favorites.has(cardId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
    const supabase = createClient();
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

  function toggleShuffle() {
    setShuffleOn((s) => !s);
    setSeed((s) => s + 1);
  }

  // ─── Pre-quiz: pick direction ───────────────────────────────────
  if (!direction) {
    return (
      <PreQuizScreen
        slug={slug}
        levelId={levelId}
        levelName={levelName}
        cardCount={cards.length}
        modes={MODES}
      />
    );
  }

  if (order.length === 0) return null;

  const item = order[index];
  const f = item.fields;
  const kanaOnly = isKanaOnly(f);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>
            {index + 1} / {order.length}
          </span>
          <span className="badge">
            {direction === "en_jp"
              ? "EN → JP"
              : direction === "jp_en"
                ? "JP → EN"
                : "Mix"}
          </span>
        </div>
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
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            {item.dir === "jp_en" ? (
              <>
                <div className="jp text-center text-5xl leading-tight">
                  {f.japanese}
                </div>
                {/* Only render hiragana below when it's a distinct
                    reading — skip for kana-only words like パン to
                    avoid printing the same string twice. */}
                {!kanaOnly && f.hiragana && (
                  <div className="jp mt-3 text-center text-xl text-muted">
                    {f.hiragana}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-3xl font-medium">
                {f.english}
              </div>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              {item.dir === "jp_en" ? "Japanese" : "English"}
            </div>
          </div>

          {/* Back — always shows japanese + hiragana + english */}
          <div
            className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-6 shadow-card"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <BackContent fields={f} kanaOnly={kanaOnly} />
          </div>
        </button>

        <div className="absolute right-2 top-2 z-10">
          <FavoriteStar
            isFavorite={favorites.has(item.id)}
            onToggle={() => toggleFavorite(item.id)}
            loggedIn={Boolean(userId)}
          />
        </div>
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

      <div className="mt-4 text-center">
        <Link
          href={`/modules/${slug}`}
          className="text-sm text-muted hover:text-ink"
        >
          ← Back to levels
        </Link>
      </div>
    </div>
  );
}

function BackContent({
  fields,
  kanaOnly,
}: {
  fields: NounFields;
  kanaOnly: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="jp text-4xl leading-tight">{fields.japanese}</div>
        {!kanaOnly && fields.hiragana && (
          <div className="jp mt-1 text-sm text-muted">{fields.hiragana}</div>
        )}
        {fields.english && (
          <div className="mt-3 text-sm font-medium uppercase tracking-wide text-muted">
            {fields.english}
          </div>
        )}
      </div>
      <ExampleBlock example={parseExample(fields.example)} />
    </div>
  );
}
