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
import {
  type NounFields,
  parseNounFields,
} from "@/components/NounFlashcardClient";
import {
  type AdjectiveFields,
  parseAdjectiveFields,
  AdjectiveClassChip,
} from "@/components/AdjectiveFlashcardClient";
import {
  type VerbFields,
  parseVerbFields,
} from "@/components/VerbFlashcardClient";

/**
 * MixedVocabFlashcardClient
 * -------------------------
 * Used for the "Beginner" level (and any future flat vocab level that
 * mixes several `card_type`s in one deck). The dispatch that
 * `QuizClient` normally does *per-level* (all nouns → NounFlashcardClient,
 * all verbs → VerbFlashcardClient …) doesn't work for a mixed deck —
 * `.every()` is false — so we do the dispatch here, *per-card*.
 *
 * Inherits automatically:
 *   * PreQuizScreen for direction (EN→JP / JP→EN / Mix)
 *   * Shuffle toggle + keyboard nav (←/→ + Space/Enter)
 *   * FavoriteStar wired to the shared `favorites` table
 *   * ExampleBlock at the bottom of every back face
 *
 * What's card-type-specific is the face content — a verb shows its
 * dictionary + masu form + group chip, an adjective shows the い/な chip
 * + long/short forms, a noun/adverb just shows word + reading + english.
 */

export type MixedVocabFields =
  | NounFields
  | VerbFields
  | AdjectiveFields;

type Direction = "en_jp" | "jp_en" | "mix";

type Item = {
  id: string;
  fields: MixedVocabFields;
  dir: "en_jp" | "jp_en";
};

type Props = {
  cards: Card[];
  slug: string;
  levelId: string;
  levelName: string;
};

const MODES: PreQuizMode[] = [
  { value: "en_jp", label: "EN → JP" },
  { value: "jp_en", label: "JP → EN" },
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

/**
 * Parse a raw card into whichever discriminated shape matches its
 * card_type. Anything unknown throws — the seed script is the single
 * source of truth for what ends up here, so an unknown card_type is a
 * bug we want surfaced immediately.
 */
function parseMixed(c: Card): MixedVocabFields {
  const t = (c.fields as { card_type?: string } | null)?.card_type;
  switch (t) {
    case "noun_flashcard":
    case "adverb_flashcard":
      return parseNounFields(c);
    case "verb_flashcard":
      return parseVerbFields(c);
    case "adjective_flashcard":
      return parseAdjectiveFields(c);
    default:
      throw new Error(
        `MixedVocabFlashcardClient: unsupported card_type "${t}" on card ${c.id}. ` +
          `Only noun / adverb / verb / adjective flashcards are supported in a mixed level.`
      );
  }
}

/**
 * TS note: NounFields' discriminator is itself a union
 * (`"noun_flashcard" | "adverb_flashcard"`), which defeats the usual
 * `if/else` narrowing over MixedVocabFields. A `switch` on
 * `card_type` — with one case per literal — reliably narrows to the
 * exact field shape inside each branch.
 */

/** Face-side type-agnostic accessor for the English string. */
function englishOf(f: MixedVocabFields): string {
  switch (f.card_type) {
    case "noun_flashcard":
    case "adverb_flashcard":
      return f.english;
    case "verb_flashcard":
      return f.translation_en;
    case "adjective_flashcard":
      return f.definition_en;
  }
}

/** Face-side type-agnostic accessor for what to render on the JP side. */
function japaneseOf(f: MixedVocabFields): { primary: string; secondary?: string } {
  switch (f.card_type) {
    case "noun_flashcard":
    case "adverb_flashcard": {
      // parseNounFields already collapses "japanese empty" cases so
      // that japanese === hiragana on kana-only words. That's the
      // single signal we check to avoid printing the reading twice.
      const kanaOnly = f.japanese.length > 0 && f.japanese === f.hiragana;
      return kanaOnly
        ? { primary: f.japanese }
        : { primary: f.japanese, secondary: f.hiragana };
    }
    case "verb_flashcard":
      // dictionary_form already combines kanji + reading in parens
      // when both are present (e.g. "食べる (たべる)") — no separate
      // secondary needed.
      return { primary: f.dictionary_form };
    case "adjective_flashcard": {
      if (!f.kanji) return { primary: f.hiragana };
      if (f.kanji === f.hiragana) return { primary: f.kanji };
      return { primary: f.kanji, secondary: f.hiragana };
    }
  }
}

/** Label shown in the small badge above each card. */
function kindLabel(f: MixedVocabFields): string {
  switch (f.card_type) {
    case "noun_flashcard":
      return "Noun";
    case "adverb_flashcard":
      return "Adverb";
    case "verb_flashcard":
      return "Verb";
    case "adjective_flashcard":
      return "Adjective";
  }
}

/**
 * Optional grammar chip: verb group (I/II/III) or adjective class (い/な).
 * Nouns/adverbs render nothing.
 */
function GrammarChip({ f }: { f: MixedVocabFields }) {
  if (f.card_type === "verb_flashcard") {
    return (
      <span className="inline-flex items-center rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
        Group {f.group}
      </span>
    );
  }
  if (f.card_type === "adjective_flashcard") {
    return <AdjectiveClassChip cls={f.adjective_class} size="sm" />;
  }
  return null;
}

/** Anything showing on the back face beyond the front's info. */
function ExtraRows({ f }: { f: MixedVocabFields }) {
  if (f.card_type === "verb_flashcard") {
    return (
      <>
        <Row label="Short form" value={f.dictionary_form} />
        <Row label="Long (masu)" value={f.masu_form} />
      </>
    );
  }
  if (f.card_type === "adjective_flashcard") {
    return (
      <>
        <Row label="Short form" value={f.short_form} />
        <Row label="Long form" value={f.long_form} />
        {f.opposite ? <Row label="Opposite" value={f.opposite} /> : null}
      </>
    );
  }
  // Noun / adverb — nothing extra beyond the header block.
  return null;
}

function exampleOf(f: MixedVocabFields) {
  return parseExample(f.example);
}

export default function MixedVocabFlashcardClient({
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

  // Parse once up front — throws early on any unsupported card_type.
  const parsedCards = useMemo(
    () => cards.map((c) => ({ id: c.id, fields: parseMixed(c) })),
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
      setFavorites(new Set((data ?? []).map((r: { card_id: string }) => r.card_id)));
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
  const jp = japaneseOf(f);
  const en = englishOf(f);
  const label = kindLabel(f);
  const example = exampleOf(f);

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
          <span className="badge-accent">{label}</span>
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
                  {jp.primary}
                </div>
                {jp.secondary && (
                  <div className="jp mt-3 text-center text-xl text-muted">
                    {jp.secondary}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <GrammarChip f={f} />
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-3xl font-medium">{en}</div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <GrammarChip f={f} />
                </div>
              </>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              {item.dir === "jp_en" ? "Japanese" : "English"}
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-6 shadow-card"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="jp text-4xl leading-tight">{jp.primary}</div>
                {jp.secondary && (
                  <div className="jp mt-1 text-sm text-muted">
                    {jp.secondary}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <GrammarChip f={f} />
                </div>
                {en && (
                  <div className="mt-3 text-sm font-medium uppercase tracking-wide text-muted">
                    {en}
                  </div>
                )}
              </div>
              <ExtraRows f={f} />
              <ExampleBlock example={example} />
            </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-baseline gap-3 text-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="jp">{value || "—"}</div>
    </div>
  );
}
