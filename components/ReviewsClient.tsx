"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { VerbFields } from "@/components/VerbFlashcardClient";
import type { AdjectiveFields } from "@/components/AdjectiveFlashcardClient";
import type { KanjiFields } from "@/components/KanjiQuizClient";
import type { NounFields } from "@/components/NounFlashcardClient";
import type { ConjugationFields } from "@/components/VerbConjugationFlashcardClient";
import { deriveHiragana } from "@/lib/verbReadings";
import { formatKunyomi } from "@/lib/kanjiReadings";
import FavoriteStar from "@/components/FavoriteStar";

// FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced
// repetition later. This client now drives a manual "favorites" deck.

export type VerbFavoriteItem = {
  cardId: string;
  fields: VerbFields;
};

export type AdjectiveFavoriteItem = {
  cardId: string;
  fields: AdjectiveFields;
};

export type KanjiFavoriteItem = {
  cardId: string;
  fields: KanjiFields;
};

export type NounFavoriteItem = {
  cardId: string;
  fields: NounFields;
};

export type ConjugationFavoriteItem = {
  cardId: string;
  fields: ConjugationFields;
};

// Unified vocab item — verbs, adjectives, nouns, and conjugation
// reference cards are all part of the Vocabulary deck but render
// differently. Tagged with `kind` so the playing screen can dispatch.
type VocabItem =
  | { kind: "verb"; cardId: string; fields: VerbFields }
  | { kind: "adjective"; cardId: string; fields: AdjectiveFields }
  | { kind: "noun"; cardId: string; fields: NounFields }
  | { kind: "conjugation"; cardId: string; fields: ConjugationFields };

type Deck = "vocab" | "kanji";

type Phase =
  | { kind: "ready" }
  | { kind: "playing"; deck: Deck };

type VocabFilter = "all" | "verbs" | "adjectives" | "nouns" | "conjugation";

type Props = {
  verbItems: VerbFavoriteItem[];
  adjectiveItems: AdjectiveFavoriteItem[];
  nounItems: NounFavoriteItem[];
  conjugationItems: ConjugationFavoriteItem[];
  kanjiItems: KanjiFavoriteItem[];
  userId: string;
};

export default function ReviewsClient({
  verbItems,
  adjectiveItems,
  nounItems,
  conjugationItems,
  kanjiItems,
  userId,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: "ready" });
  const [vocabFilter, setVocabFilter] = useState<VocabFilter>("all");
  const [vocabQueue, setVocabQueue] = useState<VocabItem[]>([]);
  const [kanjiQueue, setKanjiQueue] = useState<KanjiFavoriteItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Re-seed when the server payload changes (page refresh).
  useEffect(() => {
    setPhase({ kind: "ready" });
    setIndex(0);
    setFlipped(false);
    setVocabQueue([]);
    setKanjiQueue([]);
  }, [verbItems, adjectiveItems, nounItems, conjugationItems, kanjiItems]);

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
  }, [phase.kind, index, vocabQueue.length, kanjiQueue.length]);

  // Filtered vocab pool — recomputed when filter or source items change.
  // Used by the count on the deck card and by `startVocab` to seed the
  // session queue.
  const filteredVocabPool: VocabItem[] = useMemo(() => {
    const verbs: VocabItem[] = verbItems.map((it) => ({
      kind: "verb",
      cardId: it.cardId,
      fields: it.fields,
    }));
    const adjectives: VocabItem[] = adjectiveItems.map((it) => ({
      kind: "adjective",
      cardId: it.cardId,
      fields: it.fields,
    }));
    const nouns: VocabItem[] = nounItems.map((it) => ({
      kind: "noun",
      cardId: it.cardId,
      fields: it.fields,
    }));
    const conjugations: VocabItem[] = conjugationItems.map((it) => ({
      kind: "conjugation",
      cardId: it.cardId,
      fields: it.fields,
    }));
    if (vocabFilter === "verbs") return verbs;
    if (vocabFilter === "adjectives") return adjectives;
    if (vocabFilter === "nouns") return nouns;
    if (vocabFilter === "conjugation") return conjugations;
    return [...verbs, ...adjectives, ...nouns, ...conjugations];
  }, [verbItems, adjectiveItems, nounItems, conjugationItems, vocabFilter]);

  function startVocab() {
    if (filteredVocabPool.length === 0) return;
    setVocabQueue(filteredVocabPool.slice());
    setIndex(0);
    setFlipped(false);
    setPhase({ kind: "playing", deck: "vocab" });
  }

  function startKanji() {
    if (kanjiItems.length === 0) return;
    setKanjiQueue(kanjiItems.slice());
    setIndex(0);
    setFlipped(false);
    setPhase({ kind: "playing", deck: "kanji" });
  }

  function prev() {
    if (index === 0) return;
    setFlipped(false);
    setIndex((i) => i - 1);
  }

  function next() {
    if (phase.kind !== "playing") return;
    const len =
      phase.deck === "vocab" ? vocabQueue.length : kanjiQueue.length;
    if (index >= len - 1) return;
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  async function unfavorite(cardId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("card_id", cardId);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[favorites] delete failed:", error);
    }

    if (phase.kind !== "playing") return;
    if (phase.deck === "vocab") {
      setVocabQueue((prev) => {
        const next = prev.filter((it) => it.cardId !== cardId);
        if (next.length === 0) setPhase({ kind: "ready" });
        else if (index >= next.length) setIndex(next.length - 1);
        return next;
      });
    } else {
      setKanjiQueue((prev) => {
        const next = prev.filter((it) => it.cardId !== cardId);
        if (next.length === 0) setPhase({ kind: "ready" });
        else if (index >= next.length) setIndex(next.length - 1);
        return next;
      });
    }
    setFlipped(false);
  }

  // ─── Ready / empty ─────────────────────────────────────────────
  if (phase.kind === "ready") {
    const totalFavorites =
      verbItems.length +
      adjectiveItems.length +
      nounItems.length +
      conjugationItems.length +
      kanjiItems.length;
    if (totalFavorites === 0) {
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
        <VocabDeckCard
          filter={vocabFilter}
          onFilterChange={setVocabFilter}
          verbCount={verbItems.length}
          adjectiveCount={adjectiveItems.length}
          nounCount={nounItems.length}
          conjugationCount={conjugationItems.length}
          filteredCount={filteredVocabPool.length}
          onStart={startVocab}
        />
        <KanjiDeckCard
          count={kanjiItems.length}
          onStart={startKanji}
        />
      </div>
    );
  }

  // ─── Playing ───────────────────────────────────────────────────
  if (phase.deck === "vocab") {
    const item = vocabQueue[index];
    if (!item) {
      setPhase({ kind: "ready" });
      return null;
    }
    return (
      <SessionShell
        deckLabel="Vocabulary"
        deckSubLabel={
          item.kind === "verb"
            ? "Verb"
            : item.kind === "adjective"
              ? "Adjective"
              : item.kind === "noun"
                ? "Noun"
                : "Conjugation"
        }
        progress={`${index + 1} / ${vocabQueue.length}`}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        onPrev={prev}
        onNext={next}
        canPrev={index > 0}
        canNext={index < vocabQueue.length - 1}
        cardId={item.cardId}
        onUnfavorite={unfavorite}
        onExit={() => setPhase({ kind: "ready" })}
      >
        {item.kind === "verb" ? (
          <VerbCardFaces item={item} />
        ) : item.kind === "adjective" ? (
          <AdjectiveCardFaces item={item} />
        ) : item.kind === "noun" ? (
          <NounCardFaces item={item} />
        ) : (
          <ConjugationCardFaces item={item} />
        )}
      </SessionShell>
    );
  }

  // kanji deck
  const item = kanjiQueue[index];
  if (!item) {
    setPhase({ kind: "ready" });
    return null;
  }
  return (
    <SessionShell
      deckLabel="Kanji"
      progress={`${index + 1} / ${kanjiQueue.length}`}
      flipped={flipped}
      onFlip={() => setFlipped((f) => !f)}
      onPrev={prev}
      onNext={next}
      canPrev={index > 0}
      canNext={index < kanjiQueue.length - 1}
      cardId={item.cardId}
      onUnfavorite={unfavorite}
      onExit={() => setPhase({ kind: "ready" })}
    >
      <KanjiCardFaces item={item} />
    </SessionShell>
  );
}

// =============================================================
// Vocabulary deck-picker card (with filter pills)
// =============================================================
function VocabDeckCard({
  filter,
  onFilterChange,
  verbCount,
  adjectiveCount,
  nounCount,
  conjugationCount,
  filteredCount,
  onStart,
}: {
  filter: VocabFilter;
  onFilterChange: (f: VocabFilter) => void;
  verbCount: number;
  adjectiveCount: number;
  nounCount: number;
  conjugationCount: number;
  filteredCount: number;
  onStart: () => void;
}) {
  const empty = filteredCount === 0;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">Vocabulary</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Saved verbs, adjectives, nouns &amp; conjugations
          </p>
        </div>
        {/* Matches the bonsai illustration used on the home page's
            Vocabulary module card. */}
        <Image
          src="/icons/bonsai.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 object-contain drop-shadow-sm"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <FilterPill
          label="All"
          count={verbCount + adjectiveCount + nounCount + conjugationCount}
          active={filter === "all"}
          onClick={() => onFilterChange("all")}
        />
        <FilterPill
          label="Verbs"
          count={verbCount}
          active={filter === "verbs"}
          onClick={() => onFilterChange("verbs")}
        />
        <FilterPill
          label="Adjectives"
          count={adjectiveCount}
          active={filter === "adjectives"}
          onClick={() => onFilterChange("adjectives")}
        />
        <FilterPill
          label="Nouns"
          count={nounCount}
          active={filter === "nouns"}
          onClick={() => onFilterChange("nouns")}
        />
        <FilterPill
          label="Conjugation"
          count={conjugationCount}
          active={filter === "conjugation"}
          onClick={() => onFilterChange("conjugation")}
        />
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {filteredCount} {filteredCount === 1 ? "card" : "cards"} saved
      </p>
      {empty && (
        <p className="mt-1 text-xs text-muted">
          Star a verb or adjective to add it here.
        </p>
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

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? "bg-primary text-white shadow-soft"
          : "bg-soft text-primary hover:bg-primary-50"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-[10px] font-bold ${
          active ? "bg-white/20 text-white" : "bg-white text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// =============================================================
// Kanji deck-picker card (unchanged)
// =============================================================
function KanjiDeckCard({
  count,
  onStart,
}: {
  count: number;
  onStart: () => void;
}) {
  const empty = count === 0;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">Kanji</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Saved kanji cards
          </p>
        </div>
        {/* Matches the lantern illustration used on the home page's
            Kanji module card. */}
        <Image
          src="/icons/lantern.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 object-contain drop-shadow-sm"
        />
      </div>
      <p className="mt-4 text-2xl font-semibold">
        {count} {count === 1 ? "card" : "cards"} saved
      </p>
      {empty && (
        <p className="mt-1 text-xs text-muted">Star a kanji to add it here.</p>
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
// Session shell — flip card + nav + un-star
// =============================================================
function SessionShell({
  deckLabel,
  deckSubLabel,
  progress,
  flipped,
  onFlip,
  onPrev,
  onNext,
  canPrev,
  canNext,
  cardId,
  onUnfavorite,
  onExit,
  children,
}: {
  deckLabel: string;
  deckSubLabel?: string;
  progress: string;
  flipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  cardId: string;
  onUnfavorite: (id: string) => void;
  onExit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>{progress}</span>
          <span className="badge">{deckLabel}</span>
          {deckSubLabel && <span className="badge-accent">{deckSubLabel}</span>}
        </div>
        <button
          onClick={onExit}
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
          onClick={onFlip}
          aria-label="Flip card"
          className="relative block w-full text-left"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.55s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "420px",
          }}
        >
          {children}
        </button>

        {/* Filled star — clicking removes from favorites + queue. */}
        <div className="absolute right-2 top-2 z-10">
          <FavoriteStar
            isFavorite={true}
            onToggle={() => onUnfavorite(cardId)}
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
          onClick={onPrev}
          disabled={!canPrev}
          className="btn-outline disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="btn-primary disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// =============================================================
// Verb card faces — front English, back Japanese details
// =============================================================
function VerbCardFaces({
  item,
}: {
  item: Extract<VocabItem, { kind: "verb" }>;
}) {
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
// Adjective card faces — front English, back Japanese details
// =============================================================
function AdjectiveCardFaces({
  item,
}: {
  item: Extract<VocabItem, { kind: "adjective" }>;
}) {
  const f = item.fields;
  return (
    <>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="text-center text-3xl font-medium">
          {f.definition_en}
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
            <div className="jp text-4xl leading-tight">{f.kanji}</div>
            {f.hiragana && (
              <div className="jp mt-1 text-sm text-muted">{f.hiragana}</div>
            )}
          </div>
          <Row label="Long form" value={f.long_form} />
          <Row label="Short form" value={f.short_form} />
          {f.opposite ? (
            <Row label="Opposite" value={f.opposite} />
          ) : null}
        </div>
      </div>
    </>
  );
}

// =============================================================
// Noun card faces — English on front, JP + reading on back.
// Kana-only nouns (パン) render the reading once, never twice.
// =============================================================
function NounCardFaces({
  item,
}: {
  item: Extract<VocabItem, { kind: "noun" }>;
}) {
  const f = item.fields;
  const kanaOnly =
    f.japanese.length > 0 && f.japanese === f.hiragana;
  return (
    <>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="text-center text-3xl font-medium">{f.english}</div>
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
            <div className="jp text-4xl leading-tight">{f.japanese}</div>
            {!kanaOnly && f.hiragana && (
              <div className="jp mt-1 text-sm text-muted">{f.hiragana}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================
// Conjugation card faces — English on the front, verb + Short/Long
// toggle + 7-form table on the back.
//
// The register toggle here is local to this face render so each
// conjugation card starts on "short" — the /reviews review flow is
// short and mixed, so session-persistence would be surprising.
// =============================================================
function ConjugationCardFaces({
  item,
}: {
  item: Extract<VocabItem, { kind: "conjugation" }>;
}) {
  const f = item.fields;
  const [register, setRegister] = useState<"short" | "long">("short");
  const active = f[register];

  const rows: { key: keyof typeof active; label: string; sameHint?: boolean }[] = [
    { key: "present_aff", label: "Present affirmative" },
    { key: "present_neg", label: "Present negative" },
    { key: "past_aff",    label: "Past affirmative" },
    { key: "past_neg",    label: "Past negative" },
    { key: "te",          label: "Te-form", sameHint: true },
    { key: "tai",         label: "Tai (want to)" },
    { key: "potential",   label: "Potential" },
  ];
  const teSame = f.short.te === f.long.te;

  return (
    <>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="text-center text-3xl font-medium">{f.english}</div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="badge-accent">Group {f.group || "?"}</span>
        </div>
        <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
          English
        </div>
      </div>

      <div
        className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-4 shadow-card sm:p-5"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="space-y-3">
          <div className="text-center">
            <div className="jp text-2xl leading-tight text-ink">{f.kanji}</div>
            {f.reading && f.reading !== f.kanji && (
              <div className="jp mt-0.5 text-xs text-muted">{f.reading}</div>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Register"
            className="mx-auto inline-flex w-full max-w-[240px] rounded-full border border-border bg-white p-0.5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full">
              {(["short", "long"] as const).map((r) => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={register === r}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRegister(r);
                  }}
                  className={`flex-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    register === r
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {r === "short" ? "Short" : "Long"}
                </button>
              ))}
            </div>
          </div>

          <ul className="overflow-hidden rounded-xl border border-border/60">
            {rows.map((row, i) => (
              <li
                key={row.key}
                className={`flex items-baseline justify-between gap-3 px-3 py-2 ${
                  i % 2 === 1 ? "bg-white/70" : "bg-paper"
                }`}
              >
                <span className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {row.label}
                  {row.sameHint && teSame && (
                    <span className="ml-1 rounded-full bg-soft px-1.5 py-[1px] text-[9px] font-medium normal-case tracking-normal text-muted">
                      same
                    </span>
                  )}
                </span>
                <span className="jp shrink-0 text-right text-base leading-tight text-ink">
                  {active[row.key] || "—"}
                </span>
              </li>
            ))}
          </ul>
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
