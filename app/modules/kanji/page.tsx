import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KanjiHomeClient, {
  type KanjiGridGroup,
  type KanjiLevelRow,
} from "@/components/KanjiHomeClient";
import type { Card } from "@/lib/types";

// Cache module + level list (rarely changes).
export const revalidate = 60;

// Virtual aggregate levels own no cards — kept out of the glyph grid.
const AGGREGATE_NAMES = new Set(["All kanji - Review"]);

export default async function KanjiHome() {
  const supabase = createClient();

  // Single query feeds both the deck list and the "All kanji" grid, so
  // the two always agree.
  const { data: mod } = await supabase
    .from("modules")
    .select(
      "id, name, slug, description, module_levels(id, name, order_index, is_exam, cards(id, fields))"
    )
    .eq("slug", "kanji")
    .order("order_index", {
      foreignTable: "module_levels",
      ascending: true,
    })
    .maybeSingle();
  if (!mod) notFound();

  const rawLevels = ((mod as any).module_levels ?? []) as {
    id: string;
    name: string;
    order_index: number;
    is_exam: boolean;
    cards: Pick<Card, "id" | "fields">[];
  }[];

  const levels: KanjiLevelRow[] = rawLevels.map((lv) => ({
    id: lv.id,
    name: lv.name,
    order_index: lv.order_index,
    is_exam: !!lv.is_exam,
    cardCount: lv.cards?.length ?? 0,
  }));

  const groups: KanjiGridGroup[] = rawLevels
    .filter((lv) => !lv.is_exam && !AGGREGATE_NAMES.has(lv.name))
    .map((lv) => ({
      id: lv.id,
      name: lv.name,
      cards: (lv.cards ?? []).filter((c) => (c.fields as any)?.kanji),
    }))
    .filter((g) => g.cards.length > 0);

  return (
    <section>
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← All modules
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{mod.name}</h1>
      {mod.description && (
        <p className="mt-2 max-w-2xl text-muted">{mod.description}</p>
      )}

      <Suspense fallback={null}>
        <KanjiHomeClient levels={levels} groups={groups} />
      </Suspense>
    </section>
  );
}
