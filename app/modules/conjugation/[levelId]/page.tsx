import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TranslationQuizClient from "@/components/TranslationQuizClient";
import ConjugationQuizClient from "@/components/ConjugationQuizClient";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConjugationQuizPage({
  params,
}: {
  params: { levelId: string };
}) {
  const supabase = createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, slug")
    .eq("slug", "conjugation")
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
    .select("id, fields, level_id, created_at")
    .eq("level_id", level.id);

  const list = (cards ?? []) as Card[];

  // Detect the level's quiz format from the first card's field shape.
  const sample = list[0]?.fields as Record<string, unknown> | undefined;
  const isConjugationLevel = !!sample && "forms" in sample;
  const isTranslationLevel = !!sample && "english" in sample;

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

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
          No cards in this level yet.
        </p>
      ) : isConjugationLevel ? (
        <ConjugationQuizClient cards={list} levelId={level.id} />
      ) : isTranslationLevel ? (
        <TranslationQuizClient cards={list} levelId={level.id} />
      ) : (
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-center text-accent">
          This level&apos;s cards don&apos;t match a known format.
        </p>
      )}
    </section>
  );
}
