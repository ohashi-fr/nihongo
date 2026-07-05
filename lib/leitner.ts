/**
 * Shared config + helpers for the Leitner-box spaced-review that's
 * layered on top of the user's custom decks. Kept in one file so the
 * intervals, session caps, and derived-state rules are impossible to
 * accidentally re-define at a call site.
 *
 * Nothing in here talks to Supabase — helpers are pure. Persistence
 * lives in `custom_card_reviews` (see supabase/migrate_custom_card_reviews.sql).
 */

// ── Config ───────────────────────────────────────────────────────
export const BOX_INTERVALS: Record<LeitnerBox, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

export const NEW_CARDS_PER_DAY = 5;
export const MAX_SESSION = 20;
export const LEECH_LAPSES = 4;

// ── Types ────────────────────────────────────────────────────────
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export type CustomCardReview = {
  id: string;
  user_id: string;
  custom_card_id: string;
  box: LeitnerBox;
  /** YYYY-MM-DD in the user's local calendar. */
  due_date: string;
  last_reviewed_at: string | null;
  lapses: number;
  created_at: string;
};

/** UI-facing state — the box number is deliberately never shown. */
export type ReviewState = "new" | "learning" | "mastered";

// ── Derivations ──────────────────────────────────────────────────
export function derivedState(row: CustomCardReview | null | undefined): ReviewState {
  if (!row) return "new";
  return row.box === 5 ? "mastered" : "learning";
}

export function isLeech(row: CustomCardReview | null | undefined): boolean {
  return !!row && row.lapses >= LEECH_LAPSES;
}

/**
 * Next box after a "Je connais" tap. Caps at 5 — a card in box 5
 * that's rated known again stays in box 5 (long interval).
 */
export function nextBoxOnKnow(box: LeitnerBox): LeitnerBox {
  return Math.min(5, box + 1) as LeitnerBox;
}

// ── Local-date helpers ───────────────────────────────────────────
// The app is used in Japan — we key "today" on the browser's local
// calendar rather than UTC, matching how the streak feature computes
// dates. Everything stays as `YYYY-MM-DD` strings so the DB `date`
// column stores them verbatim.
export function localISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localISODate(date);
}

/** `true` when the `due_date` iso string is on/before today (local). */
export function isDue(dueDate: string, today: string = localISODate()): boolean {
  return dueDate <= today;
}
