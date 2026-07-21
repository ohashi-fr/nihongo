import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomDeckClient from "@/components/CustomDeckClient";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";
import type { CustomCardReview } from "@/lib/leitner";

// Fully per-user — no caching.
export const dynamic = "force-dynamic";

export const metadata = { title: "Custom deck — Nihongo" };

export default async function CustomDeckPage({
  params,
}: {
  params: { deckId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/reviews/decks/${params.deckId}`);
  }

  // Three parallel queries — deck row, its cards, and the user's
  // Leitner review rows for those cards. RLS scopes each to the
  // owner; a foreign deckId returns 0 rows and we notFound().
  //
  // The review-rows query filters via the join through custom_cards
  // — anything without a row is treated as "new" client-side.
  const [deckRes, cardsRes, reviewsRes] = await Promise.all([
    supabase
      .from("custom_decks")
      .select("id, user_id, name, illustration, last_used_at, created_at")
      .eq("id", params.deckId)
      .maybeSingle(),
    supabase
      .from("custom_cards")
      .select(
        "id, deck_id, user_id, kanji, reading, meaning_en, note, created_at, example_jp, example_en, example_reading, example_source"
      )
      .eq("deck_id", params.deckId)
      .order("created_at", { ascending: false }),
    supabase
      .from("custom_card_reviews")
      .select(
        "id, user_id, custom_card_id, box, due_date, last_reviewed_at, lapses, created_at, custom_cards!inner(deck_id)"
      )
      .eq("custom_cards.deck_id", params.deckId),
  ]);

  const deck = deckRes.data as CustomDeck | null;
  if (!deck) notFound();

  const cards = (cardsRes.data ?? []) as CustomCard[];
  // Strip the inner join tag before handing to the client — it's
  // just there to constrain the fetch to this deck.
  const reviews = ((reviewsRes.data ?? []) as any[]).map(
    ({ custom_cards: _cc, ...row }) => row as CustomCardReview
  );

  return (
    <section>
      <div className="mb-6">
        <Link
          href="/reviews"
          className="text-sm text-muted hover:text-ink"
        >
          ← My Reviews
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {deck.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {cards.length === 0
            ? "No cards yet — search a word below to add your first one."
            : `${cards.length} card${cards.length === 1 ? "" : "s"} in this deck.`}
        </p>
      </div>

      <CustomDeckClient
        deck={deck}
        initialCards={cards}
        initialReviews={reviews}
        userId={user.id}
      />
    </section>
  );
}
