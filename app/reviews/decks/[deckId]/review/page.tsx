import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomDeckReviewClient from "@/components/CustomDeckReviewClient";
import type { CustomCard, CustomDeck } from "@/lib/customDecks";

// Fully per-user — no caching.
export const dynamic = "force-dynamic";

export const metadata = { title: "Review deck — Nihongo" };

export default async function CustomDeckReviewPage({
  params,
}: {
  params: { deckId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/reviews/decks/${params.deckId}/review`);
  }

  // Two parallel queries — RLS scopes both to the deck owner. A
  // stranger's deckId returns 0 rows and we notFound().
  const [deckRes, cardsRes] = await Promise.all([
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
  ]);

  const deck = deckRes.data as CustomDeck | null;
  if (!deck) notFound();

  const cards = (cardsRes.data ?? []) as CustomCard[];

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
          Review — {deck.name}
        </h1>
      </div>

      <CustomDeckReviewClient deck={deck} cards={cards} />
    </section>
  );
}
