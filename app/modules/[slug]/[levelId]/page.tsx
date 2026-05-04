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

  const { data: level } = await supabase
    .from("module_levels")
    .select("id, name, script, module_id")
    .eq("id", params.levelId)
    .maybeSingle();

  if (!level || level.module_id !== mod.id) notFound();

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
          levelId={level.id}
          script={level.script}
        />
      )}
    </section>
  );
}
