import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LevelEditor from "@/components/LevelEditor";

export const dynamic = "force-dynamic";

export default async function EditLevelPage({
  params,
}: {
  params: { id: string; levelId: string };
}) {
  const supabase = createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, type")
    .eq("id", params.id)
    .maybeSingle();
  if (!mod) notFound();

  const { data: level } = await supabase
    .from("module_levels")
    .select("id, name, script, order_index, supports_mcq, module_id")
    .eq("id", params.levelId)
    .maybeSingle();
  if (!level || level.module_id !== mod.id) notFound();

  const { data: cards } = await supabase
    .from("cards")
    .select("id, fields, created_at")
    .eq("level_id", level.id)
    .order("created_at", { ascending: true });

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href={`/admin/modules/${mod.id}`}
        className="text-sm text-muted hover:text-ink"
      >
        ← {mod.name}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {level.name}
      </h1>

      <LevelEditor
        moduleType={mod.type as "quiz" | "conjugation"}
        level={level as any}
        cards={(cards ?? []) as any}
      />
    </section>
  );
}
