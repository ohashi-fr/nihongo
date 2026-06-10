import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function KanjiHome() {
  const supabase = createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, name, slug, description")
    .eq("slug", "kanji")
    .maybeSingle();
  if (!mod) notFound();

  const { data: levels } = await supabase
    .from("module_levels")
    .select("id, name, order_index, is_exam, cards(id)")
    .eq("module_id", mod.id)
    .order("order_index", { ascending: true });

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
          No levels yet — run <code>seed_kanji.sql</code>.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {levels.map((lv: any) => {
            const exam = !!lv.is_exam;
            return (
              <li key={lv.id}>
                <Link
                  href={`/modules/kanji/${lv.id}`}
                  className={`flex items-center justify-between px-5 py-4 transition ${
                    exam
                      ? "border-l-4 border-l-accent bg-accent/[0.04] hover:bg-accent/[0.08]"
                      : "hover:bg-soft"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                      {String(lv.order_index ?? 0).padStart(2, "0")}
                    </span>
                    <span className={`font-medium ${exam ? "text-accent" : ""}`}>
                      {lv.name}
                    </span>
                    {exam ? (
                      <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                        Exam
                      </span>
                    ) : (
                      <span className="badge jp">漢字</span>
                    )}
                  </div>
                  <div className="text-sm text-muted">
                    {exam
                      ? "20 random questions"
                      : `${lv.cards?.length ?? 0} kanji`}{" "}
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
