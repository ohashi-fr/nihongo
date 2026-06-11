"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";
import PreQuizScreen, { type PreQuizMode } from "@/components/PreQuizScreen";
import KanjiRecognitionCard from "@/components/KanjiRecognitionCard";
import KanjiWritingCard from "@/components/KanjiWritingCard";
import KanjiWordsCard, { type WordItem } from "@/components/KanjiWordsCard";
import KanjiStudyCard from "@/components/KanjiStudyCard";
import { formatKunyomi } from "@/lib/kanjiReadings";

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

type Mode = "recognition" | "writing" | "words" | "study";

type Item =
  | { kind: "card"; id: string; fields: KanjiFields }
  | { kind: "word"; id: string; word: WordItem };

type Props = {
  cards: Card[];
  levelId: string;
  slug: string;
  levelName: string;
};

const MODES: PreQuizMode[] = [
  { value: "recognition", label: "Read it" },
  { value: "writing", label: "Write it" },
  { value: "words", label: "Words" },
  { value: "study", label: "Study" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function buildWordItems(cards: Card[]): WordItem[] {
  const items: WordItem[] = [];
  for (const c of cards) {
    const f = parseKanjiFields(c);
    if (f.examples.length === 0) continue;
    const parent = f.kanji;
    const parentMeaning = f.meanings[0] ?? "";
    for (const ex of f.examples) {
      items.push({
        word: ex.word,
        reading: ex.reading,
        meaning: ex.meaning,
        parent_kanji: parent,
        parent_meaning: parentMeaning,
      });
    }
  }
  return items;
}

export default function KanjiQuizClient({
  cards,
  levelId,
  slug,
  levelName,
}: Props) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode: Mode | null =
    modeParam === "recognition" ||
    modeParam === "writing" ||
    modeParam === "words" ||
    modeParam === "study"
      ? modeParam
      : null;

  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [done, setDone] = useState(false);
  const [savedSession, setSavedSession] = useState(false);

  // Cheat sheet panel (regular modes only).
  const [cheatOpen, setCheatOpen] = useState(false);

  // Parsed cards in the original (card insertion) order — used by Study
  // mode and by the cheat sheet.
  const parsedCards = useMemo(
    () => cards.map((c) => ({ id: c.id, fields: parseKanjiFields(c) })),
    [cards]
  );

  // Build the playable order from the URL mode.
  const order: Item[] = useMemo(() => {
    if (!mode || mode === "study") return [];
    if (mode === "words") {
      return shuffle(
        buildWordItems(cards).map((w, i) => ({
          kind: "word" as const,
          id: `${w.parent_kanji}-${w.word}-${i}`,
          word: w,
        }))
      );
    }
    return shuffle(
      parsedCards.map((p) => ({
        kind: "card" as const,
        id: p.id,
        fields: p.fields,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cards, parsedCards, shuffleSeed]);

  const total = order.length;
  const current = order[index];

  useEffect(() => {
    setFirstTry(true);
  }, [index]);

  useEffect(() => {
    if (!done || savedSession) return;
    (async () => {
      try {
        const supabase = createClient();
        await supabase.from("sessions").insert({
          level_id: levelId,
          total_cards: total,
          correct_first_try: correctFirstTry,
        });
        setSavedSession(true);
      } catch {
        /* silent */
      }
    })();
  }, [done, savedSession, levelId, total, correctFirstTry]);

  // ESC closes the cheat sheet.
  useEffect(() => {
    if (!cheatOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCheatOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cheatOpen]);

  function handleAnswered(wasCorrect: boolean) {
    if (wasCorrect && firstTry) {
      setCorrectFirstTry((n) => n + 1);
    }
    setFirstTry(false);
  }

  function advance() {
    if (index + 1 >= total) setDone(true);
    else setIndex((i) => i + 1);
  }

  function reset() {
    setShuffleSeed((s) => s + 1);
    setIndex(0);
    setCorrectFirstTry(0);
    setFirstTry(true);
    setDone(false);
    setSavedSession(false);
  }

  // ─── Pre-quiz ────────────────────────────────────────────────────
  if (!mode) {
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

  // ─── Study mode — pure browser ──────────────────────────────────
  if (mode === "study") {
    return (
      <>
        <div className="mx-auto max-w-2xl">
          <KanjiStudyCard cards={parsedCards} />
        </div>
      </>
    );
  }

  // ─── Empty pool ────────────────────────────────────────────────
  if (order.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
        {mode === "words"
          ? "This level has no example words yet."
          : "No cards available."}
      </div>
    );
  }

  // ─── Done ──────────────────────────────────────────────────────
  if (done) {
    const pct = total === 0 ? 0 : Math.round((correctFirstTry / total) * 100);
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-card">
        <div className="jp text-5xl">お疲れ様</div>
        <h2 className="mt-4 text-2xl font-semibold">Done!</h2>
        <p className="mt-2 text-muted">
          {correctFirstTry} / {total} correct on first try
        </p>
        <div className="my-6 text-4xl font-semibold">{pct}%</div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={reset} className="btn-primary">
            Restart
          </button>
          <a href="../" className="btn-outline">
            Back to levels
          </a>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const badge =
    mode === "recognition"
      ? "Read it"
      : mode === "writing"
        ? "Write it"
        : "Words";

  const progressLabel =
    mode === "words" ? `Word ${index + 1} / ${total}` : `Card ${index + 1} / ${total}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>{progressLabel}</span>
          <span className="badge">{badge}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="hover:text-ink underline-offset-2 hover:underline"
          >
            Reshuffle
          </button>
          <button
            onClick={() => setCheatOpen(true)}
            className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-card hover:bg-soft"
          >
            Cheat Sheet
          </button>
        </div>
      </div>

      {current.kind === "card" && mode === "recognition" && (
        <KanjiRecognitionCard
          key={current.id}
          fields={current.fields}
          onAnswered={handleAnswered}
          onNext={advance}
        />
      )}
      {current.kind === "card" && mode === "writing" && (
        <KanjiWritingCard
          key={current.id}
          fields={current.fields}
          onAnswered={handleAnswered}
          onNext={advance}
        />
      )}
      {current.kind === "word" && (
        <KanjiWordsCard
          key={current.id}
          item={current.word}
          onAnswered={handleAnswered}
          onNext={advance}
        />
      )}

      <KanjiCheatSheetPanel
        open={cheatOpen}
        onClose={() => setCheatOpen(false)}
        items={parsedCards}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Cheat sheet panel — same slide-in pattern as Counting, kanji content.
// ─────────────────────────────────────────────────────────────────────
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
      {/* Click-away overlay */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in panel */}
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
