import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizClient from "@/components/QuizClient";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: { slug: string; levelId: string };
}) {
  const supabase = createClient();

  // Parallelize the 3 queries — they all key off URL params, none depend
  // on each other. Was 3 sequential round-trips, now 1.
  const [modRes, levelRes, cardsRes] = await Promise.all([
    supabase
      .from("modules")
      .select("id, name, slug, type")
      .eq("slug", params.slug)
      .maybeSingle(),
    supabase
      .from("module_levels")
      .select("id, name, script, supports_mcq, module_id")
      .eq("id", params.levelId)
      .maybeSingle(),
    supabase.from("cards").select("id, fields").eq("level_id", params.levelId),
  ]);

  const mod = modRes.data;
  const level = levelRes.data;
  const cards = cardsRes.data;

  if (!mod) notFound();
  if (!level || level.module_id !== mod.id) notFound();

  const supportsMcq = Boolean(level.supports_mcq);

  return (
    <section>
      <div className="mb-6">
        <Link
          href={`/modules/${mod.slug}`}
          className="text-sm text-muted hover:text-ink"
        >
          ← {mod.name}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {level.name}
        </h1>
      </div>

      {!cards || cards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
          No cards in this level yet.
        </p>
      ) : (
        <QuizClient
          cards={cards as any}
          moduleType={mod.type as "quiz" | "conjugation"}
          slug={mod.slug}
          levelId={level.id}
          levelName={level.name}
          script={level.script}
          supportsMcq={supportsMcq}
        />
      )}
    </section>
  );
}
