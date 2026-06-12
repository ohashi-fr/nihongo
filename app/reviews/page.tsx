import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewsClient, {
  type VerbFavoriteItem,
  type KanjiFavoriteItem,
} from "@/components/ReviewsClient";

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

  // Pull every favourited card for this user, joined to its card row,
  // then split in JS by `fields.card_type`. RLS scopes rows to the
  // current user automatically.
  const { data: favRows } = await supabase
    .from("favorites")
    .select("card_id, created_at, cards!inner(id, fields)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const verbItems: VerbFavoriteItem[] = [];
  const kanjiItems: KanjiFavoriteItem[] = [];

  for (const r of ((favRows ?? []) as any[])) {
    const type = r.cards?.fields?.card_type;
    if (type === "verb_flashcard") {
      verbItems.push({ cardId: r.card_id, fields: r.cards.fields });
    } else if (type === "kanji_flashcard") {
      kanjiItems.push({ cardId: r.card_id, fields: r.cards.fields });
    }
  }

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

      <ReviewsClient
        verbItems={verbItems}
        kanjiItems={kanjiItems}
        userId={user.id}
      />
    </section>
  );
}
