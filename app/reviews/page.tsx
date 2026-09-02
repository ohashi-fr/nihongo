import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewsClient, {
  type VerbFavoriteItem,
  type KanjiFavoriteItem,
  type KanjiWordFavoriteItem,
  type AdjectiveFavoriteItem,
  type NounFavoriteItem,
  type AdverbFavoriteItem,
  type ConjugationFavoriteItem,
} from "@/components/ReviewsClient";
import CustomDecksList from "@/components/CustomDecksList";
import type { CustomDeckWithCount } from "@/lib/customDecks";

// Fully per-user — no caching possible.
export const dynamic = "force-dynamic";

export const metadata = { title: "My Reviews — Nihongo" };

export default async function ReviewsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/reviews");
  }

  // Pull every favourited id for this user, then the matching card
  // rows, and join in JS — split by `fields.card_type`. RLS scopes
  // both queries to the current user / public read automatically.
  //
  // Two round-trips instead of an embedded `cards!inner(...)` select:
  // that embed relies on PostgREST resolving a *database* foreign key
  // between `favorites.card_id` and `cards.id`, which no longer
  // exists (see supabase/migrate_word_favorites.sql — dropped so
  // Kanji "Words" mode can favorite synthetic per-word ids that don't
  // have a `cards` row). Doing the join here also means a favorited
  // word id — which has no matching `cards` row — is silently
  // skipped rather than 500ing the whole page.
  const { data: favRows } = await supabase
    .from("favorites")
    .select("card_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cardIds = (favRows ?? []).map((r) => r.card_id);
  const { data: cardRows } =
    cardIds.length > 0
      ? await supabase.from("cards").select("id, fields").in("id", cardIds)
      : { data: [] as { id: string; fields: any }[] };

  const fieldsByCardId = new Map(
    (cardRows ?? []).map((c) => [c.id, c.fields as any])
  );

  const verbItems: VerbFavoriteItem[] = [];
  const adjectiveItems: AdjectiveFavoriteItem[] = [];
  const nounItems: NounFavoriteItem[] = [];
  const adverbItems: AdverbFavoriteItem[] = [];
  const conjugationItems: ConjugationFavoriteItem[] = [];
  const kanjiItems: KanjiFavoriteItem[] = [];

  for (const r of favRows ?? []) {
    const fields = fieldsByCardId.get(r.card_id);
    if (!fields) continue; // e.g. a Words-mode word id — no card row
    const type = fields.card_type;
    if (type === "verb_flashcard") {
      verbItems.push({ cardId: r.card_id, fields });
    } else if (type === "adjective_flashcard") {
      adjectiveItems.push({ cardId: r.card_id, fields });
    } else if (type === "noun_flashcard") {
      nounItems.push({ cardId: r.card_id, fields });
    } else if (type === "adverb_flashcard") {
      // Adverbs live in the Vocabulary deck under their own filter
      // pill; they reuse `NounFields` since the shape is identical.
      adverbItems.push({ cardId: r.card_id, fields });
    } else if (type === "verb_conjugation") {
      conjugationItems.push({ cardId: r.card_id, fields });
    } else if (type === "kanji_flashcard") {
      kanjiItems.push({ cardId: r.card_id, fields });
    }
  }

  // Any leftover favorite ids didn't match a real `cards` row above —
  // in Kanji "Words" mode those are synthetic per-word ids (see
  // `wordCardId` in components/KanjiQuizClient.tsx: a kanji card's
  // real id with its last byte swapped for the word's index, since a
  // word has no row of its own in `cards`). Recover the word by
  // matching that id's prefix against a kanji card's real id, then
  // indexing into *that* kanji's `examples[]` with the last byte.
  const unmatchedIds = (favRows ?? [])
    .map((r) => r.card_id)
    .filter((id) => !fieldsByCardId.has(id));

  const kanjiWordItems: KanjiWordFavoriteItem[] = [];
  if (unmatchedIds.length > 0) {
    const { data: kanjiCards } = await supabase
      .from("cards")
      .select("id, fields")
      .eq("fields->>card_type", "kanji_flashcard");
    const kanjiByPrefix = new Map(
      (kanjiCards ?? []).map((c) => [c.id.slice(0, -2), c])
    );
    for (const id of unmatchedIds) {
      const kanjiCard = kanjiByPrefix.get(id.slice(0, -2));
      const wordIndex = parseInt(id.slice(-2), 16);
      const example = (kanjiCard?.fields as any)?.examples?.[wordIndex];
      if (example) {
        kanjiWordItems.push({
          cardId: id,
          word: example.word,
          reading: example.reading,
          meaning: example.meaning,
        });
      }
    }
  }

  // Custom decks + card counts. Two queries in parallel — the counts
  // come back as a small aggregate; the raw deck list gives us the
  // ordering + names. RLS scopes both to the current user.
  const [decksRes, cardCountsRes] = await Promise.all([
    supabase
      .from("custom_decks")
      .select("id, user_id, name, illustration, last_used_at, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("custom_cards").select("deck_id"),
  ]);

  const counts = new Map<string, number>();
  for (const row of (cardCountsRes.data ?? []) as { deck_id: string }[]) {
    counts.set(row.deck_id, (counts.get(row.deck_id) ?? 0) + 1);
  }

  const customDecks: CustomDeckWithCount[] = (
    (decksRes.data ?? []) as Omit<CustomDeckWithCount, "card_count">[]
  ).map((d) => ({ ...d, card_count: counts.get(d.id) ?? 0 }));

  return (
    <section>
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← Home
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          My Reviews
        </h1>
        <p className="mt-2 text-muted">
          Cards you&apos;ve starred from the flashcards. Pick a deck and
          cycle through it freely — there&apos;s no schedule. Tap the{" "}
          <span className="text-[#eab308]">★</span> on a card to drop it
          from the list once mastered.
        </p>
      </div>

      <CustomDecksList decks={customDecks} userId={user.id} />

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-ink">
          Favorites
        </h2>
        <ReviewsClient
          verbItems={verbItems}
          adjectiveItems={adjectiveItems}
          nounItems={nounItems}
          adverbItems={adverbItems}
          conjugationItems={conjugationItems}
          kanjiItems={kanjiItems}
          kanjiWordItems={kanjiWordItems}
          userId={user.id}
        />
      </div>
    </section>
  );
}
