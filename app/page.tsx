import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Module, ModuleLevel } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";

// Modules list changes rarely (admin-edited). Cache for 60s with
// stale-while-revalidate so the home page renders instantly on hover-
// prefetch, then refreshes in the background.
export const revalidate = 60;

type ModuleWithLevels = Module & { module_levels: { id: string }[] };

// Hand-mapped illustrations per module slug. Files live in /public/icons.
// Unmapped slugs fall back to the ramen illustration.
const SLUG_ICON: Record<string, string> = {
  vocabulary: "/icons/bonsai.png",
  conjugation: "/icons/bridge.png",
  counting: "/icons/ramen.png",
  kanji: "/icons/lantern.png",
};
const FALLBACK_ICON = "/icons/bonsai.png";

export default async function HomePage() {
  const supabase = createClient();

  const { data: modules, error } = await supabase
    .from("modules")
    .select("id, name, slug, description, type, created_at, module_levels(id)")
    .order("created_at", { ascending: true })
    .returns<ModuleWithLevels[]>();

  return (
    <section>
      <SectionHeader
        kicker="Study"
        title="Modules"
        subtitle="Choose what to study. Each module groups themed levels of cards."
      />

      {error ? (
        <ErrorBox message={error.message} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/grammar"
            className="card-tile group flex flex-col items-center text-center"
          >
            <div className="flex h-28 w-28 items-center justify-center">
              <Image
                src="/icons/zen-garden.png"
                alt=""
                width={112}
                height={112}
                className="h-28 w-28 object-contain drop-shadow-sm transition group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 text-xl font-bold text-ink">Grammar</h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              Reference notes for every notion — objective, rule, examples.
            </p>
            <div className="mt-6 flex w-full items-center justify-between border-t border-border pt-4 text-xs">
              <span className="font-medium text-muted">26 notions</span>
              <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
                Open →
              </span>
            </div>
          </Link>

          {modules?.map((m) => {
            const iconSrc = SLUG_ICON[m.slug] ?? FALLBACK_ICON;
            return (
              <Link
                key={m.id}
                href={`/modules/${m.slug}`}
                className="card-tile group flex flex-col items-center text-center"
              >
                <div className="flex h-28 w-28 items-center justify-center">
                  <Image
                    src={iconSrc}
                    alt=""
                    width={112}
                    height={112}
                    className="h-28 w-28 object-contain drop-shadow-sm transition group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-4 text-xl font-bold text-ink">{m.name}</h2>
                {m.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {m.description}
                  </p>
                )}
                <div className="mt-6 flex w-full items-center justify-between border-t border-border pt-4 text-xs">
                  <span className="font-medium text-muted">
                    {m.module_levels.length}{" "}
                    {m.module_levels.length === 1 ? "level" : "levels"}
                  </span>
                  <span className="font-semibold text-primary transition group-hover:translate-x-0.5">
                    Open →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-accent-300/50 bg-accent-50 p-4 text-sm text-accent-900">
      <strong>Couldn&apos;t load modules.</strong> {message}
      <p className="mt-2 text-xs text-muted">
        Make sure your <code>.env.local</code> is set and the SQL schema has run.
      </p>
    </div>
  );
}
