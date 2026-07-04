import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Generic module level list, now group-aware.
 *
 *   * Levels with `group_name IS NULL` render as flat rows exactly
 *     as before (Verbs, Adjectives, older levels…).
 *   * Levels with a `group_name` collapse into ONE row per distinct
 *     group name, showing a small summary ("Nouns · 12 categories ·
 *     240 cards") and linking to the intermediate group page at
 *     /modules/<slug>/group/<groupName>.
 *
 * Order: flat rows and group rows share the same `order_index`
 * axis. A group's sort key is the *minimum* `order_index` of its
 * members — so a group whose earliest level sits at 5 renders in
 * the same slot as a flat level at 5. This keeps the ordering
 * intuitive: the group appears where its content would have
 * appeared, rather than being pushed to the top or bottom.
 *
 * Modules with zero grouped levels render identically to before —
 * the grouping is purely additive.
 */

// Modules + levels rarely change. Cache 60s with stale-while-revalidate
// so hover-prefetching from the home grid is near-instant.
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

type FlatEntry = {
  kind: "level";
  order_index: number;
  level: LevelRow;
};

type GroupEntry = {
  kind: "group";
  order_index: number; // min of members
  name: string;
  levels: LevelRow[];
  totalCards: number;
};

type Entry = FlatEntry | GroupEntry;

export default async function ModulePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select(
      "id, name, slug, description, type, module_levels(id, name, script, order_index, group_name, cards(id))"
    )
    .eq("slug", params.slug)
    .order("order_index", {
      foreignTable: "module_levels",
      ascending: true,
    })
    .maybeSingle();

  if (!mod) notFound();

  const levels = ((mod as any).module_levels as LevelRow[] | null) ?? [];

  // ── Bucket into flat rows + group rows ──────────────────────────
  const groups = new Map<string, GroupEntry>();
  const flat: FlatEntry[] = [];

  for (const lv of levels) {
    if (lv.group_name && lv.group_name.length > 0) {
      const existing = groups.get(lv.group_name);
      const cards = lv.cards?.length ?? 0;
      if (existing) {
        existing.levels.push(lv);
        existing.totalCards += cards;
        // Keep the earliest order_index so the group sits where its
        // first level would have.
        if (lv.order_index < existing.order_index) {
          existing.order_index = lv.order_index;
        }
      } else {
        groups.set(lv.group_name, {
          kind: "group",
          order_index: lv.order_index,
          name: lv.group_name,
          levels: [lv],
          totalCards: cards,
        });
      }
    } else {
      flat.push({ kind: "level", order_index: lv.order_index, level: lv });
    }
  }

  const entries: Entry[] = [
    ...flat,
    ...Array.from(groups.values()),
  ].sort((a, b) => a.order_index - b.order_index);

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

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-muted">
          No levels yet.
        </p>
      ) : (
        <ul className="surface divide-y divide-border overflow-hidden">
          {entries.map((e) =>
            e.kind === "level" ? (
              <FlatLevelRow
                key={`lv-${e.level.id}`}
                slug={mod.slug}
                level={e.level}
              />
            ) : (
              <GroupRow
                key={`grp-${e.name}`}
                slug={mod.slug}
                group={e}
              />
            )
          )}
        </ul>
      )}
    </section>
  );
}

// =============================================================
// Flat level row — unchanged shape from before this feature.
// =============================================================
function FlatLevelRow({
  slug,
  level: lv,
}: {
  slug: string;
  level: LevelRow;
}) {
  return (
    <li>
      <Link
        href={`/modules/${slug}/${lv.id}`}
        className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-soft"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-[11px] font-bold text-primary">
            {String(lv.order_index ?? 0).padStart(2, "0")}
          </span>
          <span className="truncate font-semibold text-ink">{lv.name}</span>
          <span className="badge jp">
            {SCRIPT_LABELS[lv.script] ?? lv.script}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="text-muted">{lv.cards?.length ?? 0} cards</span>
          <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

// =============================================================
// Group row — folds N levels into one row that opens a nested page.
// =============================================================
function GroupRow({
  slug,
  group,
}: {
  slug: string;
  group: GroupEntry;
}) {
  const count = group.levels.length;
  return (
    <li>
      <Link
        href={`/modules/${slug}/group/${encodeURIComponent(group.name)}`}
        className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-soft"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700"
          >
            {/* folder-like glyph — signals "opens a group" */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h5l2 2h11v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            </svg>
          </span>
          <span className="truncate font-semibold text-ink">
            {group.name}
          </span>
          <span className="badge">
            {count} {count === 1 ? "category" : "categories"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="text-muted">{group.totalCards} cards</span>
          <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </Link>
    </li>
  );
}
