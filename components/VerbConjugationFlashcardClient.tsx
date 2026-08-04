"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Card } from "@/lib/types";
import PreQuizScreen, { type PreQuizMode } from "@/components/PreQuizScreen";
import { useFavorites } from "@/lib/hooks/useFavorites";
import FavoriteStar from "@/components/FavoriteStar";

/**
 * Verb-conjugation reference flashcards.
 *
 * Card fields shape (persisted by seed_conjugation_flashcards.sql):
 *
 *   {
 *     card_type: 'verb_conjugation',
 *     group: 'I' | 'II' | 'III',
 *     kanji, reading, english, ending_note,
 *     short: { present_aff, present_neg, past_aff, past_neg, te, tai, potential },
 *     long:  { …same 7 keys },
 *   }
 *
 * UI shape:
 *   - Pre-quiz screen picks direction (EN → JP / JP → EN / Mix).
 *   - Front-JP: kanji large, reading below, "Group I/II/III" pill,
 *     small ending-note pill for context.
 *   - Front-EN: english large.
 *   - Back: a 7-row conjugation table with a persistent-across-session
 *     Short ⇄ Long segmented toggle. The te-form row is annotated
 *     "same" because it doesn't change between the two.
 *   - FavoriteStar in the top-right (same behaviour as other clients).
 */

type Forms = {
  present_aff: string;
  present_neg: string;
  past_aff: string;
  past_neg: string;
  te: string;
  tai: string;
  potential: string;
};

export type ConjugationFields = {
  card_type: "verb_conjugation";
  group: "I" | "II" | "III" | string;
  kanji: string;
  reading: string;
  english: string;
  ending_note: string;
  short: Forms;
  long: Forms;
};

type Direction = "en_jp" | "jp_en" | "mix";
type Register = "short" | "long";

type Item = {
  id: string;
  fields: ConjugationFields;
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

const FORM_ROWS: { key: keyof Forms; label: string; noteWhenSame?: boolean }[] = [
  { key: "present_aff", label: "Present affirmative" },
  { key: "present_neg", label: "Present negative" },
  { key: "past_aff",    label: "Past affirmative" },
  { key: "past_neg",    label: "Past negative" },
  { key: "te",          label: "Te-form", noteWhenSame: true },
  { key: "tai",         label: "Tai (want to)" },
  { key: "potential",   label: "Potential" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseConjugationFields(c: Card): ConjugationFields {
  const f = c.fields as any;
  const emptyForms: Forms = {
    present_aff: "",
    present_neg: "",
    past_aff: "",
    past_neg: "",
    te: "",
    tai: "",
    potential: "",
  };
  return {
    card_type: "verb_conjugation",
    group: f.group ?? "",
    kanji: f.kanji ?? "",
    reading: f.reading ?? "",
    english: f.english ?? "",
    ending_note: f.ending_note ?? "",
    short: { ...emptyForms, ...(f.short ?? {}) },
    long: { ...emptyForms, ...(f.long ?? {}) },
  };
}

export default function VerbConjugationFlashcardClient({
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
    () => cards.map((c) => ({ id: c.id, fields: parseConjugationFields(c) })),
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
  // Register persists across the whole session — nicer UX than
  // resetting to "short" on every card.
  const [register, setRegister] = useState<Register>("short");

  // ── Auth + favorites (mirrors the other flashcard clients) ─────
  const { userId, favorites, toggleFavorite } = useFavorites(parsedCards);

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

  // ── Pre-quiz screen ────────────────────────────────────────────
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
            // Slightly taller than the other clients to fit the 7-row
            // table without cramping on mobile.
            minHeight: "540px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 shadow-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            {item.dir === "jp_en" ? (
              <FrontJP fields={f} />
            ) : (
              <FrontEN fields={f} />
            )}
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted">
              {item.dir === "jp_en" ? "Japanese" : "English"}
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 overflow-y-auto rounded-lg border border-border bg-paper p-5 shadow-card sm:p-6"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <BackContent
              fields={f}
              register={register}
              onRegisterChange={setRegister}
              // Prevent the parent card flip when interacting with
              // the segmented toggle. The stopPropagation lives on
              // the toggle's onClick handlers.
            />
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

// =============================================================
// Front — Japanese side
// =============================================================
function FrontJP({ fields }: { fields: ConjugationFields }) {
  const showReading = fields.reading && fields.reading !== fields.kanji;
  return (
    <>
      <div className="jp text-center text-5xl leading-tight">
        {fields.kanji}
      </div>
      {showReading && (
        <div className="jp mt-3 text-center text-xl text-muted">
          {fields.reading}
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <GroupBadge group={fields.group} />
        {fields.ending_note && <EndingNoteBadge note={fields.ending_note} />}
      </div>
    </>
  );
}

// =============================================================
// Front — English side
// =============================================================
function FrontEN({ fields }: { fields: ConjugationFields }) {
  return (
    <>
      <div className="text-center text-3xl font-medium">
        {fields.english}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <GroupBadge group={fields.group} />
      </div>
    </>
  );
}

function GroupBadge({ group }: { group: string }) {
  return (
    <span className="badge-accent">
      Group {group || "?"}
    </span>
  );
}

function EndingNoteBadge({ note }: { note: string }) {
  return (
    <span className="rounded-full border border-border bg-white/70 px-2.5 py-1 text-[11px] font-medium text-muted">
      {note}
    </span>
  );
}

// =============================================================
// Back — head strip + Short/Long toggle + 7-row table
// =============================================================
function BackContent({
  fields,
  register,
  onRegisterChange,
}: {
  fields: ConjugationFields;
  register: Register;
  onRegisterChange: (r: Register) => void;
}) {
  const active = fields[register];
  return (
    <div className="space-y-4">
      {/* Head strip — verb + group + toggle */}
      <div className="text-center">
        <div className="jp text-3xl leading-tight text-ink">
          {fields.kanji}
        </div>
        {fields.reading && fields.reading !== fields.kanji && (
          <div className="jp mt-0.5 text-xs text-muted">{fields.reading}</div>
        )}
        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
          {fields.english}
        </div>
      </div>

      <RegisterToggle value={register} onChange={onRegisterChange} />

      {/* Table — 7 rows, tight but airy */}
      <ul className="overflow-hidden rounded-xl border border-border/60">
        {FORM_ROWS.map((row, i) => {
          const value = active[row.key];
          const teSame =
            row.noteWhenSame && fields.short.te === fields.long.te;
          return (
            <li
              key={row.key}
              className={`flex items-baseline justify-between gap-3 px-3 py-2.5 sm:px-4 ${
                i % 2 === 1 ? "bg-white/70" : "bg-paper"
              }`}
            >
              <span className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {row.label}
                {teSame && (
                  <span className="ml-1.5 rounded-full bg-soft px-1.5 py-[1px] text-[9px] font-medium normal-case tracking-normal text-muted">
                    same in both
                  </span>
                )}
              </span>
              <span className="jp shrink-0 text-right text-lg leading-tight text-ink sm:text-xl">
                {value || "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RegisterToggle({
  value,
  onChange,
}: {
  value: Register;
  onChange: (r: Register) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Conjugation register"
      className="mx-auto inline-flex w-full max-w-[280px] rounded-full border border-border bg-white p-0.5 shadow-soft sm:mx-auto sm:block"
      // Any click inside the toggle must not flip the card. The
      // buttons already stopPropagation individually — this is a
      // second net so a stray tap on padding doesn't leak either.
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex w-full">
        <ToggleButton
          label="Short"
          sub="普通"
          active={value === "short"}
          onClick={() => onChange("short")}
        />
        <ToggleButton
          label="Long"
          sub="です・ます"
          active={value === "long"}
          onClick={() => onChange("long")}
        />
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex flex-1 flex-col items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-primary text-white shadow-soft"
          : "text-muted hover:text-primary"
      }`}
    >
      <span>{label}</span>
      <span
        className={`jp mt-0.5 text-[10px] font-normal leading-none ${
          active ? "text-white/80" : "text-muted"
        }`}
      >
        {sub}
      </span>
    </button>
  );
}
