"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Card } from "@/lib/types";
import PreQuizScreen, { type PreQuizMode } from "@/components/PreQuizScreen";
import VerbCheatSheet from "@/components/VerbCheatSheet";
import { deriveHiragana } from "@/lib/verbReadings";
import { createClient } from "@/lib/supabase/client";
import FavoriteStar from "@/components/FavoriteStar";
import ExampleBlock from "@/components/ExampleBlock";
import { parseExample } from "@/lib/exampleSentence";

// FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
// repetition later. The card_reviews table is still in the schema.

export type VerbFields = {
  card_type: "verb_flashcard";
  group: string;
  dictionary_form: string;
  te_form: string;
  ta_form: string;
  nai_form: string;
  masu_form: string;
  potential_form: string;
  translation_en: string;
  /** Optional example sentence (populated by the Tatoeba backfill). */
  example?: import("@/lib/exampleSentence").ExampleSentence;
};

type Direction = "en_jp" | "jp_en" | "mix";

type Item = {
  id: string;
  fields: VerbFields;
  // For "mix": resolved per card.
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

export function parseVerbFields(c: Card): VerbFields {
  const f = c.fields as any;
  return {
    card_type: "verb_flashcard",
    group: f.group ?? "",
    dictionary_form: f.dictionary_form ?? "",
    te_form: f.te_form ?? "",
    ta_form: f.ta_form ?? "",
    nai_form: f.nai_form ?? "",
    masu_form: f.masu_form ?? "",
    potential_form: f.potential_form ?? "",
    translation_en: f.translation_en ?? "",
  };
}

export default function VerbFlashcardClient({
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
    () => cards.map((c) => ({ id: c.id, fields: parseVerbFields(c) })),
    [cards]
  );

  const [shuffleOn, setShuffleOn] = useState(false);
  // Order is rebuilt whenever direction/shuffle changes via this seed.
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
  const [cheatOpen, setCheatOpen] = useState(false);

  // Auth state — used to conditionally render the favorite star.
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

  // Fetch favorites for this user + this level's cards.
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
    if (!userId) {
      // eslint-disable-next-line no-console
      console.warn("[favorites] no userId — star noop");
      return;
    }
    const isFav = favorites.has(cardId);

    // Optimistic
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(cardId);
      else next.add(cardId);
      return next;
    });

    const supabase = createClient();

    // TEMP DEBUG — confirm the browser client actually has a session.
    // Remove once favorites are verified working.
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
        // Roll back the optimistic toggle.
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
        // Roll back the optimistic toggle.
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
      }
    }
  }

  // Reset index when order is rebuilt (direction or shuffle changed).
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

  // FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
  // repetition later.

  useEffect(() => {
    if (cheatOpen) return; // cheat sheet handles its own keys
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "Escape") {
        // no-op here; cheat sheet has its own handler when open
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, order.length, cheatOpen]);

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
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={shuffleOn}
              onChange={toggleShuffle}
              className="h-4 w-4 rounded border-border accent-ink"
            />
            <span>Shuffle</span>
          </label>
          <button
            onClick={() => setCheatOpen(true)}
            className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-card hover:bg-soft"
          >
            Cheat Sheet
          </button>
        </div>
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
              <div className="jp text-center text-5xl leading-tight">
                {f.dictionary_form}
              </div>
            ) : (
              <div className="text-center text-3xl font-medium">
                {f.translation_en}
              </div>
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

        {/* Favorite star — top-right of the card, above the flip button */}
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

      {/* FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
          repetition later. Card favoriting is handled by the star
          button in the top-right of the card. */}

      <div className="mt-4 text-center">
        <Link
          href={`/modules/${slug}`}
          className="text-sm text-muted hover:text-ink"
        >
          ← Back to levels
        </Link>
      </div>

      <VerbCheatSheet
        open={cheatOpen}
        onClose={() => setCheatOpen(false)}
        cards={parsedCards}
      />
    </div>
  );
}

function BackContent({
  fields,
  frontDir,
}: {
  fields: VerbFields;
  frontDir: "en_jp" | "jp_en";
}) {
  const dict = fields.dictionary_form;

  // Whichever piece of meta wasn't on the front goes near the top.
  const otherSide =
    frontDir === "jp_en" ? fields.translation_en : fields.dictionary_form;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="jp text-4xl leading-tight">{dict}</div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Group {fields.group}
          </span>
          {frontDir === "jp_en" && (
            <span className="text-xs text-muted">— {otherSide}</span>
          )}
        </div>
      </div>

      <Row label="Long (masu)" value={deriveHiragana(fields.masu_form, dict)} jp />
      <Row label="Te form" value={deriveHiragana(fields.te_form, dict)} jp />
      <Row label="Ta form" value={deriveHiragana(fields.ta_form, dict)} jp />
      <Row label="Nai form" value={deriveHiragana(fields.nai_form, dict)} jp />
      <Row
        label="Potential"
        value={deriveHiragana(fields.potential_form, dict)}
        jp
      />

      <ExampleBlock example={parseExample(fields.example)} />
    </div>
  );
}

function Row({
  label,
  value,
  jp,
}: {
  label: string;
  value: string;
  jp?: boolean;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-baseline gap-3 text-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={jp ? "jp" : ""}>{value || "—"}</div>
    </div>
  );
}

// FSRS rating button removed — see lib/fsrs.ts to re-enable spaced
// repetition later.
