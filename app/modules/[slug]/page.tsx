import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionHeader from "@/components/ui/SectionHeader";

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
      <Link
        href="/"
        className="mb-3 inline-flex items-center text-sm font-medium text-muted transition hover:text-primary"
      >
        ← All modules
      </Link>
      <SectionHeader
        kicker="Module"
        title={mod.name}
        subtitle={mod.description ?? undefined}
      />

      {!levels || levels.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-muted">
          No levels yet.
        </p>
      ) : (
        <ul className="surface divide-y divide-border overflow-hidden">
          {levels.map((lv: any) => (
            <li key={lv.id}>
              <Link
                href={`/modules/${mod.slug}/${lv.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-soft"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-[11px] font-bold text-primary">
                    {String(lv.order_index ?? 0).padStart(2, "0")}
                  </span>
                  <span className="truncate font-semibold text-ink">
                    {lv.name}
                  </span>
                  <span className="badge jp">
                    {SCRIPT_LABELS[lv.script] ?? lv.script}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <span className="text-muted">
                    {lv.cards?.length ?? 0} cards
                  </span>
                  <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
