"use server";

import { revalidatePath } from "next/cache";

/**
 * Server-action revalidators for the custom-deck surfaces.
 *
 * Why this file exists — the pages under /reviews are already
 * `export const dynamic = "force-dynamic"`, so their server-side
 * data cache is always fresh at request time. What still gets served
 * stale is the client-side **Router Cache**: when you navigate to a
 * route Next.js has an RSC payload for (from a prior visit or a
 * `<Link>` prefetch), it's served from that cache first.
 *
 * `router.refresh()` only invalidates the *current* route. It does
 * nothing for other cached routes. `revalidatePath()`, when called
 * from a server action that a client component triggers, invalidates
 * the target path on both the server cache and the current tab's
 * router cache — so subsequent navigations pull fresh data.
 *
 * Split into two exports so callers signal intent:
 *   - `revalidateDecksList()` for changes visible only on /reviews
 *     (new deck, deleted deck, rename showing in the grid).
 *   - `revalidateDeck(deckId)` for changes to a specific deck's
 *     detail page (add/delete card, edit deck) — also revalidates
 *     the list because the card count on the deck card changes.
 */

export async function revalidateDecksList() {
  revalidatePath("/reviews");
}

export async function revalidateDeck(deckId: string) {
  revalidatePath("/reviews");
  revalidatePath(`/reviews/decks/${deckId}`);
}
