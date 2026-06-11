import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Modules + levels rarely change. Cache 60s with stale-while-revalidate
// so hover-prefetching from the home grid is near-instant.
export const revalidate = 60;

const SCRIPT_LABELS: Record<string, string> = {
  hiragana: "ひらがな",
  katakana: "カタカナ",
  both: "かな",
  none: "—",
};

export default async function ModulePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  // Single query — module with its levels nested (and cards' ids for the
  // count). Replaces the previous 2 sequential queries.
  const { data: mod } = await supabase
    .from("modules")
    .select(
      "id, name, slug, description, type, module_levels(id, name, script, order_index, cards(id))"
    )
    .eq("slug", params.slug)
    .order("order_index", {
      foreignTable: "module_levels",
      ascending: true,
    })
    .maybeSingle();

  if (!mod) notFound();

  const levels = (mod as any).module_levels as
    | {
        id: string;
        name: string;
        script: string;
        order_index: number;
        cards: { id: string }[];
      }[]
    | null;

  return (
    <section>
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted hover:text-ink"
        >
          ← All modules
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{mod.name}</h1>
        {mod.description && (
          <p className="mt-2 max-w-2xl text-muted">{mod.description}</p>
        )}
      </div>

      {!levels || levels.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
          No levels yet.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {levels.map((lv: any) => (
            <li key={lv.id}>
              <Link
                href={`/modules/${mod.slug}/${lv.id}`}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {String(lv.order_index ?? 0).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{lv.name}</span>
                  <span className="badge jp">
                    {SCRIPT_LABELS[lv.script] ?? lv.script}
                  </span>
                </div>
                <div className="text-sm text-muted">
                  {lv.cards?.length ?? 0} cards →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
