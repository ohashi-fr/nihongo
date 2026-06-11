import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Cache module + level list (rarely changes).
export const revalidate = 60;

export default async function CountingHome() {
  const supabase = createClient();

  // Single query — replaces 2 sequential ones.
  const { data: mod } = await supabase
    .from("modules")
    .select(
      "id, name, slug, description, module_levels(id, name, order_index, cards(id))"
    )
    .eq("slug", "counting")
    .order("order_index", {
      foreignTable: "module_levels",
      ascending: true,
    })
    .maybeSingle();
  if (!mod) notFound();

  const levels = (mod as any).module_levels as
    | { id: string; name: string; order_index: number; cards: { id: string }[] }[]
    | null;

  return (
    <section>
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← All modules
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{mod.name}</h1>
      {mod.description && (
        <p className="mt-2 max-w-2xl text-muted">{mod.description}</p>
      )}

      {!levels || levels.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
          No levels yet — run <code>seed_counting.sql</code>.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {levels.map((lv: any) => {
            const isFinalBoss = lv.order_index === 11;
            return (
              <li key={lv.id}>
                <Link
                  href={`/modules/counting/${lv.id}`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                      {String(lv.order_index ?? 0).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{lv.name}</span>
                    {isFinalBoss && (
                      <span className="badge bg-accent/10 text-accent border-accent/30">
                        Final Boss
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted">
                    {isFinalBoss
                      ? "10 random cards"
                      : `${lv.cards?.length ?? 0} cards`}{" "}
                    →
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
