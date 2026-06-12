import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KanjiQuizClient from "@/components/KanjiQuizClient";
import KanjiExamClient from "@/components/KanjiExamClient";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function KanjiLevelPage({
  params,
}: {
  params: { levelId: string };
}) {
  const supabase = createClient();

  // 3 parallel queries up front — module, level, and (speculatively) the
  // level's own cards. The cards query is wasted in exam mode (the exam
  // level has none) but cheap, and saves a round-trip in the regular path.
  const [modRes, levelRes, levelCardsRes] = await Promise.all([
    supabase
      .from("modules")
      .select("id, name, slug")
      .eq("slug", "kanji")
      .maybeSingle(),
    supabase
      .from("module_levels")
      .select("id, name, order_index, is_exam, module_id")
      .eq("id", params.levelId)
      .maybeSingle(),
    supabase
      .from("cards")
      .select("id, fields, level_id, created_at")
      .eq("level_id", params.levelId),
  ]);

  const mod = modRes.data;
  const level = levelRes.data;
  if (!mod) notFound();
  if (!level || level.module_id !== mod.id) notFound();

  const isExam = !!level.is_exam;
  const isAggregate = level.name === "All Kanjis - Mid Terms";

  // Aggregate "All Kanjis" — virtual level. Fetch every card from every
  // regular (non-exam, non-aggregate) kanji level and treat the result
  // as if it were the level's own card list. Same card.id as the source
  // levels, so card_reviews entries dedupe naturally.
  if (isAggregate) {
    const { data: regularLevels } = await supabase
      .from("module_levels")
      .select("id, name")
      .eq("module_id", mod.id)
      .eq("is_exam", false)
      .neq("id", level.id)
      .order("order_index", { ascending: true });

    const ids = (regularLevels ?? []).map((l: any) => l.id);
    let pool: Card[] = [];
    if (ids.length > 0) {
      const { data: poolCards } = await supabase
        .from("cards")
        .select("id, fields, level_id, created_at")
        .in("level_id", ids);
      pool = (poolCards ?? []) as Card[];
    }

    return (
      <section>
        <div className="mb-6">
          <Link
            href="/modules/kanji"
            className="text-sm text-muted hover:text-ink"
          >
            ← {mod.name}
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {level.name}
            </h1>
            <span className="inline-flex items-center rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2563eb]">
              All
            </span>
          </div>
        </div>

        {pool.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
            No kanji exist yet in the other levels — seed them first.
          </p>
        ) : (
          <KanjiQuizClient
            cards={pool}
            levelId={level.id}
            slug={mod.slug}
            levelName={level.name}
          />
        )}
      </section>
    );
  }

  // For the exam: fetch every kanji card from the module's other levels
  // (regular kanji levels), plus a map of level_id → name for the result
  // breakdown. The exam itself doesn't store cards.
  if (isExam) {
    // Exam pulls every kanji from the module's regular levels. Sibling
    // level ids and the card pool are still one dependent chain — but
    // we already paid for `levelCardsRes` (which is empty for the exam)
    // in the first round-trip, so this is the only extra delay.
    // Exclude the aggregate level — it has no cards of its own and
    // would otherwise show up as a 0-card row in the breakdown.
    const { data: regularLevels } = await supabase
      .from("module_levels")
      .select("id, name")
      .eq("module_id", mod.id)
      .eq("is_exam", false)
      .neq("name", "All Kanjis - Mid Terms")
      .order("order_index", { ascending: true });

    const ids = (regularLevels ?? []).map((l: any) => l.id);
    let pool: Card[] = [];
    const levelNames: Record<string, string> = {};
    (regularLevels ?? []).forEach((l: any) => {
      levelNames[l.id] = l.name;
    });

    if (ids.length > 0) {
      const { data: poolCards } = await supabase
        .from("cards")
        .select("id, fields, level_id, created_at")
        .in("level_id", ids);
      pool = (poolCards ?? []) as Card[];
    }

    return (
      <section>
        <div className="mb-6">
          <Link
            href="/modules/kanji"
            className="text-sm text-muted hover:text-ink"
          >
            ← {mod.name}
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {level.name}
            </h1>
            <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
              Exam
            </span>
          </div>
        </div>

        <KanjiExamClient
          pool={pool}
          levelId={level.id}
          levelNames={levelNames}
        />
      </section>
    );
  }

  // Regular kanji level — we already fetched these in the parallel
  // first pass above.
  const list = (levelCardsRes.data ?? []) as Card[];

  return (
    <section>
      <div className="mb-6">
        <Link
          href="/modules/kanji"
          className="text-sm text-muted hover:text-ink"
        >
          ← {mod.name}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {level.name}
        </h1>
      </div>

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
          No kanji in this level yet.
        </p>
      ) : (
        <KanjiQuizClient
          cards={list}
          levelId={level.id}
          slug={mod.slug}
          levelName={level.name}
        />
      )}
    </section>
  );
}
