import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CountingQuizClient from "@/components/CountingQuizClient";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CountingQuizPage({
  params,
}: {
  params: { levelId: string };
}) {
  const supabase = createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, slug")
    .eq("slug", "counting")
    .maybeSingle();
  if (!mod) notFound();

  const { data: level } = await supabase
    .from("module_levels")
    .select("id, name, order_index, module_id")
    .eq("id", params.levelId)
    .maybeSingle();
  if (!level || level.module_id !== mod.id) notFound();

  const isFinalBoss = level.order_index === 11;

  let cards: Card[] = [];

  if (isFinalBoss) {
    // Pull every card from the module's other levels and let the
    // client randomly draw 10 from that pool.
    const { data: otherLevels } = await supabase
      .from("module_levels")
      .select("id")
      .eq("module_id", mod.id)
      .neq("order_index", 11);
    const ids = (otherLevels ?? []).map((l: any) => l.id);
    if (ids.length > 0) {
      const { data: pool } = await supabase
        .from("cards")
        .select("id, fields, level_id, created_at")
        .in("level_id", ids);
      cards = (pool ?? []) as Card[];
    }
  } else {
    const { data: levelCards } = await supabase
      .from("cards")
      .select("id, fields, level_id, created_at")
      .eq("level_id", level.id);
    cards = (levelCards ?? []) as Card[];
  }

  return (
    <section>
      <div className="mb-6">
        <Link
          href="/modules/counting"
          className="text-sm text-muted hover:text-ink"
        >
          ← {mod.name}
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {level.name}
          </h1>
          {isFinalBoss && (
            <span className="badge bg-accent/10 text-accent border-accent/30">
              Final Boss
            </span>
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
          {isFinalBoss
            ? "No cards exist yet in the other levels — seed them first."
            : "No cards in this level yet."}
        </p>
      ) : (
        <CountingQuizClient
          cards={cards}
          levelId={level.id}
          isFinalBoss={isFinalBoss}
        />
      )}
    </section>
  );
}
