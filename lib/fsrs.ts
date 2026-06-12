/**
 * Thin wrapper around `ts-fsrs` for the FSRS scheduler used by the
 * review system. Hides the library's `Card` shape and converts to/from
 * the row shape stored in the `card_reviews` table.
 *
 * Uses the library's default parameters (`generatorParameters()`).
 *
 * Vocabulary:
 *   - "review row" — JSON-friendly snapshot of an entry in `card_reviews`
 *   - "FSRS card"  — the in-memory shape ts-fsrs operates on
 */

import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card as FsrsCard,
  type Grade,
} from "ts-fsrs";

const scheduler = fsrs(generatorParameters());

export type RatingName = "again" | "hard" | "good" | "easy";

// `Grade` excludes Rating.Manual, which is what `scheduler.next` requires.
const RATING_MAP: Record<RatingName, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

/**
 * The shape we store/round-trip through Supabase. All Date fields are
 * ISO strings so the same object goes straight into a PostgREST upsert
 * payload without further serialisation.
 */
export type ReviewRow = {
  due: string;
  stability: number | null;
  difficulty: number | null;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
};

function rowToCard(r: ReviewRow): FsrsCard {
  return {
    due: new Date(r.due),
    stability: r.stability ?? 0,
    difficulty: r.difficulty ?? 0,
    elapsed_days: r.elapsed_days ?? 0,
    scheduled_days: r.scheduled_days ?? 0,
    // `learning_steps` was added in ts-fsrs v5. It's not persisted in
    // the DB row (the migrate_reviews.sql schema predates it), so we
    // restart at 0 each session. Safe — the scheduler still produces
    // correct intervals from stability/difficulty/state.
    learning_steps: 0,
    reps: r.reps ?? 0,
    lapses: r.lapses ?? 0,
    state: (r.state ?? 0) as FsrsCard["state"],
    last_review: r.last_review ? new Date(r.last_review) : undefined,
  };
}

function cardToRow(c: FsrsCard): ReviewRow {
  return {
    due: c.due.toISOString(),
    stability: c.stability ?? null,
    difficulty: c.difficulty ?? null,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as number,
    last_review: c.last_review ? c.last_review.toISOString() : null,
  };
}

/**
 * Initial review row for a card the user has never rated.
 * Mirrors `ts-fsrs.createEmptyCard()`.
 */
export function newReviewRow(): ReviewRow {
  return cardToRow(createEmptyCard());
}

/**
 * Apply a rating to an existing review row and return the next state.
 * `now` defaults to the current time and is the date that gets written
 * into the row's `last_review` field.
 */
export function scheduleNext(
  current: ReviewRow,
  rating: RatingName,
  now: Date = new Date()
): ReviewRow {
  const card = rowToCard(current);
  const result = scheduler.next(card, now, RATING_MAP[rating]);
  return cardToRow(result.card);
}
