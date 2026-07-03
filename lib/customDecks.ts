/**
 * Shared types + tiny helpers for the user-authored custom-deck
 * feature (`custom_decks` + `custom_cards` tables). Kept separate from
 * `lib/types.ts` because those are the module/level/card types tied
 * to the seeded modules — custom decks live in a different world.
 */

export type CustomDeck = {
  id: string;
  user_id: string;
  name: string;
  /** Filename in /public/icons/, from `lib/deckIllustrations.ts`. */
  illustration: string | null;
  /** Bumped by a Postgres trigger whenever a card is added. */
  last_used_at: string | null;
  created_at: string;
};

export type CustomCard = {
  id: string;
  deck_id: string;
  user_id: string;
  kanji: string | null;
  reading: string;
  meaning_en: string;
  note: string | null;
  created_at: string;
};

/** Deck with the count of cards it owns, for list rendering. */
export type CustomDeckWithCount = CustomDeck & { card_count: number };
