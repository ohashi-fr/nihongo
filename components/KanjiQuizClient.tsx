"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";
import PreQuizScreen, { type PreQuizMode } from "@/components/PreQuizScreen";
import FavoriteStar from "@/components/FavoriteStar";
import { formatKunyomi } from "@/lib/kanjiReadings";

// =============================================================
// KanjiQuizClient — flip-flashcard client, identical pattern to
// VerbFlashcardClient / AdjectiveFlashcardClient. Replaces the
// previous "Read it / Write it / Words / Study" four-mode dispatch.
// The three Read/Write/Words component files have been removed.
// =============================================================

export type KanjiExample = {
  word: string;
  reading: string;
  meaning: string;
};

export type KanjiFields = {
  kanji: string;
  meanings: string[];
  kunyomi: string[];
  onyomi: string[];
  examples: KanjiExample[];
};

type Direction = "en_jp" | "jp_en" | "mix";

type Item = {
  id: string;
  fields: KanjiFields;
  dir: "en_jp" | "jp_en";
};

type Props = {
  cards: Card[];
  levelId: string;
  slug: string;
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

/**
 * Pure parser used both inside this component and externally by
 * `KanjiExamClient` / `ReviewsClient`. Same shape as before.
 */
export function parseKanjiFields(c: Card): KanjiFields {
  const f = c.fields as any;
  return {
    kanji: f.kanji ?? "",
    meanings: Array.isArray(f.meanings) ? f.meanings : [],
    kunyomi: Array.isArray(f.kunyomi) ? f.kunyomi : [],
    onyomi: Array.isArray(f.onyomi) ? f.onyomi : [],
    examples: Array.isArray(f.examples) ? f.examples : [],
  };
}

export default function KanjiQuizClient({
  cards,
  levelId,
  slug,
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
    () => cards.map((c) => ({ id: c.id, fields: parseKanjiFields(c) })),
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
  const [cheatOpen, setCheatOpen] = useState(false);

  // ── Auth + favorites (same pattern as VerbFlashcardClient) ──────
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

  // Reset position when the queue is re-built.
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

  // Keyboard navigation — disabled while the cheat sheet is open so
  // arrow keys don't accidentally skip cards behind it.
  useEffect(() => {
    if (cheatOpen) return;
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
  }, [index, order.length, cheatOpen]);

  // Esc closes the cheat sheet.
  useEffect(() => {
    if (!cheatOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCheatOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cheatOpen]);

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

  if (order.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-muted">
        No kanji in this level yet.
      </p>
    );
  }

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
              <div className="jp text-[140px] leading-none">{f.kanji}</div>
            ) : (
              <div className="text-center text-3xl font-medium">
                {f.meanings.join(", ") || "—"}
              </div>
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              {item.dir === "jp_en" ? "Japanese" : "English"}
            </div>
          </div>

          {/* Back — always shows full details */}
          <div
            className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-6 shadow-card"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <BackContent fields={f} />
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

      <KanjiCheatSheetPanel
        open={cheatOpen}
        onClose={() => setCheatOpen(false)}
        items={parsedCards}
      />
    </div>
  );
}

// =============================================================
// Back-face content — kanji + meanings + readings + examples
// =============================================================
function BackContent({ fields }: { fields: KanjiFields }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="jp text-5xl leading-none">{fields.kanji}</div>
        {fields.meanings.length > 0 && (
          <div className="mt-3 text-sm font-medium uppercase tracking-wide text-muted">
            {fields.meanings.join(", ")}
          </div>
        )}
      </div>

      {fields.kunyomi.length > 0 && (
        <Row
          label="Kun'yomi"
          value={fields.kunyomi.map(formatKunyomi).join("、")}
        />
      )}
      {fields.onyomi.length > 0 && (
        <Row label="On'yomi" value={fields.onyomi.join("、")} />
      )}

      {fields.examples.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-muted">
            Examples
          </div>
          <ul className="mt-1 space-y-1 text-sm">
            {fields.examples.map((ex, i) => (
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

// =============================================================
// Cheat sheet panel — slide-in from the right (unchanged shape
// from the previous version).
// =============================================================
function KanjiCheatSheetPanel({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: { id: string; fields: KanjiFields }[];
}) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Cheat Sheet"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-[320px] flex-col border-l border-border bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">
            Cheat Sheet
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cheat sheet"
            className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-soft hover:text-ink"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted">Nothing to show.</p>
          ) : (
            <ul className="space-y-3">
              {items.map(({ id, fields: f }) => (
                <li
                  key={id}
                  className="grid grid-cols-[40px_1fr] items-start gap-3 text-sm"
                >
                  <span className="jp text-2xl leading-none">{f.kanji}</span>
                  <div>
                    <div>{f.meanings.join(", ")}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {f.kunyomi.length > 0 && (
                        <>
                          kun:{" "}
                          <span className="jp">
                            {f.kunyomi.map(formatKunyomi).join("、")}
                          </span>
                        </>
                      )}
                      {f.kunyomi.length > 0 && f.onyomi.length > 0 && (
                        <span> · </span>
                      )}
                      {f.onyomi.length > 0 && (
                        <>
                          on:{" "}
                          <span className="jp">{f.onyomi.join("、")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
