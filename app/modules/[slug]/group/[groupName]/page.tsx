import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Intermediate "group" page — /modules/<slug>/group/<groupName>.
 *
 * Lists every level in a module that shares the given `group_name`.
 * Header shows the "Module › Group" breadcrumb; each row links to
 * the existing quiz/flashcard flow at /modules/<slug>/<levelId>,
 * unchanged.
 *
 * If the module has no levels tagged with this group name, we
 * 404 rather than render an empty page — someone typing the URL by
 * hand shouldn't get a silent success.
 */

export const revalidate = 60;

const SCRIPT_LABELS: Record<string, string> = {
  hiragana: "ひらがな",
  katakana: "カタカナ",
  both: "かな",
  none: "—",
};

type LevelRow = {
  id: string;
  name: string;
  script: string;
  order_index: number;
  group_name: string | null;
  cards: { id: string }[];
};

export default async function ModuleGroupPage({
  params,
}: {
  params: { slug: string; groupName: string };
}) {
  const decodedGroup = decodeURIComponent(params.groupName);

  const supabase = createClient();
  const { data: mod } = await supabase
    .from("modules")
    .select(
      "id, name, slug, description, module_levels(id, name, script, order_index, group_name, cards(id))"
    )
    .eq("slug", params.slug)
    .order("order_index", {
      foreignTable: "module_levels",
      ascending: true,
    })
    .maybeSingle();

  if (!mod) notFound();

  const all = ((mod as any).module_levels as LevelRow[] | null) ?? [];
  const levels = all.filter((lv) => lv.group_name === decodedGroup);

  if (levels.length === 0) notFound();

  const totalCards = levels.reduce(
    (n, lv) => n + (lv.cards?.length ?? 0),
    0
  );

  return (
    <section>
      {/* Breadcrumb — one step back to the module, one home shortcut */}
      <div className="mb-3 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-primary">
          All modules
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/modules/${mod.slug}`}
          className="font-medium hover:text-primary"
        >
          {mod.name}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-ink">{decodedGroup}</span>
      </div>

      <SectionHeader
        kicker="Group"
        title={decodedGroup}
        subtitle={`${levels.length} categories · ${totalCards} cards`}
      />

      <ul className="surface divide-y divide-border overflow-hidden">
        {levels.map((lv) => (
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

      <Link
        href={`/modules/${mod.slug}`}
        className="mt-6 inline-block text-sm text-muted hover:text-ink"
      >
        ← Back to {mod.name}
      </Link>
    </section>
  );
}
