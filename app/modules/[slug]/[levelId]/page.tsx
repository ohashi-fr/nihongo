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

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, slug, type")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!mod) notFound();

  const { data: level, error: levelErr } = await supabase
    .from("module_levels")
    .select("id, name, script, supports_mcq, module_id")
    .eq("id", params.levelId)
    .maybeSingle();

  // TEMP DEBUG — remove once MCQ is confirmed working
  // eslint-disable-next-line no-console
  console.log("[QuizPage server] route=/modules/" + params.slug + "/" + params.levelId);
  // eslint-disable-next-line no-console
  console.log("[QuizPage server] module slug+id =", mod.slug, mod.id);
  // eslint-disable-next-line no-console
  console.log("[QuizPage server] level row =", level);
  // eslint-disable-next-line no-console
  console.log("[QuizPage server] level.supports_mcq =", level?.supports_mcq, "typeof =", typeof level?.supports_mcq);
  // eslint-disable-next-line no-console
  console.log("[QuizPage server] supabase level error =", levelErr);

  if (!level || level.module_id !== mod.id) notFound();

  const supportsMcq = Boolean(level.supports_mcq);

  // eslint-disable-next-line no-console
  console.log("[QuizPage server] passing supportsMcq prop =", supportsMcq);

  const { data: cards } = await supabase
    .from("cards")
    .select("id, fields")
    .eq("level_id", level.id);

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
