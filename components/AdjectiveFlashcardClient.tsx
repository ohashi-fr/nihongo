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

// Field shape persisted by `seed_adjectives.sql` (older) and by
// `seed_beginner_lessons.sql` (newer — always populates `adjective_class`).
//
// `adjective_class` distinguishes い-adjectives from な-adjectives and is
// rendered as a small kana chip on the card faces so the learner can
// tell them apart at a glance. This is display-only — long_form /
// short_form are always the pre-computed strings from the seed JSON, we
// NEVER conjugate at render time (guarantees we can't produce garbage
// like 便利いです for a な-adjective).
export type AdjectiveFields = {
  card_type: "adjective_flashcard";
  kanji: string;
  hiragana: string;
  long_form: string;
  short_form: string;
  definition_en: string;
  opposite: string;
  /** `"i"` for い-adjectives, `"na"` for な-adjectives. Absent on legacy cards. */
  adjective_class?: "i" | "na";
  /** Optional example sentence (populated by the Tatoeba backfill). */
  example?: import("@/lib/exampleSentence").ExampleSentence;
};

type Direction = "en_jp" | "jp_en" | "mix";

type Item = {
  id: string;
  fields: AdjectiveFields;
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

export function parseAdjectiveFields(c: Card): AdjectiveFields {
  const f = c.fields as any;
  const rawClass = typeof f.adjective_class === "string"
    ? f.adjective_class.toLowerCase()
    : "";
  const adjectiveClass: AdjectiveFields["adjective_class"] =
    rawClass === "i" || rawClass === "na" ? rawClass : undefined;
  return {
    card_type: "adjective_flashcard",
    kanji: f.kanji ?? "",
    hiragana: f.hiragana ?? "",
    long_form: f.long_form ?? "",
    short_form: f.short_form ?? "",
    definition_en: f.definition_en ?? "",
    opposite: f.opposite ?? "",
    ...(adjectiveClass ? { adjective_class: adjectiveClass } : {}),
    ...(f.example ? { example: f.example } : {}),
  };
}

/**
 * Small "い" / "な" chip shown next to the Japanese form. Kept
 * exportable so the mixed-vocab client (Beginner level) can reuse the
 * exact same styling and avoid drifting between screens.
 */
export function AdjectiveClassChip({
  cls,
  size = "sm",
}: {
  cls: AdjectiveFields["adjective_class"];
  size?: "sm" | "md";
}) {
  if (!cls) return null;
  const label = cls === "i" ? "い" : "な";
  const dim = size === "md" ? "px-2 py-0.5 text-sm" : "px-1.5 py-0 text-xs";
  return (
    <span
      title={cls === "i" ? "i-adjective" : "na-adjective"}
      className={`jp inline-flex items-center rounded-full border border-primary/25 bg-primary-50 font-semibold text-primary ${dim}`}
    >
      {label}
    </span>
  );
}

export default function AdjectiveFlashcardClient({
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
    () => cards.map((c) => ({ id: c.id, fields: parseAdjectiveFields(c) })),
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

  // ── Auth + favorites (same pattern as VerbFlashcardClient) ───────
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

  // Reset index when order rebuilds.
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
                  {f.kanji}
                </div>
                {f.hiragana && (
                  <div className="jp mt-3 text-center text-xl text-muted">
                    {f.hiragana}
                  </div>
                )}
                {f.adjective_class && (
                  <div className="mt-4">
                    <AdjectiveClassChip cls={f.adjective_class} size="md" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center text-3xl font-medium">
                  {f.definition_en}
                </div>
                {f.adjective_class && (
                  <div className="mt-4">
                    <AdjectiveClassChip cls={f.adjective_class} size="md" />
                  </div>
                )}
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
            <BackContent fields={f} frontDir={item.dir} />
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
  frontDir,
}: {
  fields: AdjectiveFields;
  frontDir: "en_jp" | "jp_en";
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="jp text-4xl leading-tight">{fields.kanji}</div>
        {fields.hiragana && (
          <div className="jp mt-1 text-sm text-muted">{fields.hiragana}</div>
        )}
        {fields.adjective_class && (
          <div className="mt-2">
            <AdjectiveClassChip cls={fields.adjective_class} />
          </div>
        )}
        {frontDir === "jp_en" && fields.definition_en && (
          <div className="mt-2 text-sm font-medium uppercase tracking-wide text-muted">
            — {fields.definition_en}
          </div>
        )}
      </div>

      <Row label="Long form" value={fields.long_form} />
      <Row label="Short form" value={fields.short_form} />
      {fields.opposite ? (
        <Row label="Opposite" value={fields.opposite} />
      ) : null}

      <ExampleBlock example={parseExample(fields.example)} />
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
