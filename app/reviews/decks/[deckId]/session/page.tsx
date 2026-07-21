import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomDeckSessionClient from "@/components/CustomDeckSessionClient";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";
import type { CustomCardReview } from "@/lib/leitner";

/**
 * Server page for the Leitner daily review session of a custom
 * deck. Fetches the deck, all its cards, and the user's existing
 * review rows (including the `created_at` we need for the
 * "new-cards-today" budget). Queue building itself is done on the
 * client so the local calendar wins for "today".
 *
 * Redirects anon users to /login; 404s foreign deck ids.
 */

export const dynamic = "force-dynamic";

export const metadata = { title: "Review session — Nihongo" };

export default async function CustomDeckSessionPage({
  params,
}: {
  params: { deckId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/reviews/decks/${params.deckId}/session`);
  }

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
  const reviews = ((reviewsRes.data ?? []) as any[]).map(
    ({ custom_cards: _cc, ...row }) => row as CustomCardReview
  );

  return (
    <section>
      <div className="mb-6">
        <Link
          href={`/reviews/decks/${deck.id}`}
          className="text-sm text-muted hover:text-ink"
        >
          ← {deck.name}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Today&apos;s review
        </h1>
      </div>

      <CustomDeckSessionClient
        deck={deck}
        cards={cards}
        initialReviews={reviews}
        userId={user.id}
      />
    </section>
  );
}
