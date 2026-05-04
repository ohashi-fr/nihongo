import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ModuleForm from "@/components/ModuleForm";
import LevelManager from "@/components/LevelManager";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, slug, description, type")
    .eq("id", params.id)
    .maybeSingle();
  if (!mod) notFound();

  const { data: levels } = await supabase
    .from("module_levels")
    .select("id, name, script, order_index, cards(id)")
    .eq("module_id", mod.id)
    .order("order_index", { ascending: true });

  return (
    <section className="mx-auto max-w-3xl">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{mod.name}</h1>

      <div className="mt-6 rounded-lg border border-border bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Module
        </h2>
        <ModuleForm mode="edit" initial={mod as any} />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Levels
        </h2>
        <LevelManager moduleId={mod.id} levels={(levels ?? []) as any} />
      </div>
    </section>
  );
}
