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

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, slug")
    .eq("slug", "kanji")
    .maybeSingle();
  if (!mod) notFound();

  const { data: level } = await supabase
    .from("module_levels")
    .select("id, name, order_index, is_exam, module_id")
    .eq("id", params.levelId)
    .maybeSingle();
  if (!level || level.module_id !== mod.id) notFound();

  const isExam = !!level.is_exam;

  // For the exam: fetch every kanji card from the module's other levels
  // (regular kanji levels), plus a map of level_id → name for the result
  // breakdown. The exam itself doesn't store cards.
  if (isExam) {
    const { data: regularLevels } = await supabase
      .from("module_levels")
      .select("id, name")
      .eq("module_id", mod.id)
      .eq("is_exam", false)
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

  // Regular kanji level.
  const { data: cards } = await supabase
    .from("cards")
    .select("id, fields, level_id, created_at")
    .eq("level_id", level.id);

  const list = (cards ?? []) as Card[];

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
