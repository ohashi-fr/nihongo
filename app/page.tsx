import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Module, ModuleLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

type ModuleWithLevels = Module & { module_levels: { id: string }[] };

export default async function HomePage() {
  const supabase = createClient();

  const { data: modules, error } = await supabase
    .from("modules")
    .select("id, name, slug, description, type, created_at, module_levels(id)")
    .order("created_at", { ascending: true })
    .returns<ModuleWithLevels[]>();

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Modules</h1>
        <p className="mt-2 text-muted">
          Choose what to study. Each module groups levels of cards.
        </p>
      </div>

      {error ? (
        <ErrorBox message={error.message} />
      ) : !modules || modules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.id}
              href={`/modules/${m.slug}`}
              className="card-tile group"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{m.name}</h2>
                <span className="badge">{m.type}</span>
              </div>
              {m.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {m.description}
                </p>
              )}
              <div className="mt-4 text-xs text-muted">
                {m.module_levels.length}{" "}
                {m.module_levels.length === 1 ? "level" : "levels"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white/50 p-10 text-center">
      <p className="text-muted">No modules yet.</p>
      <p className="mt-2 text-sm text-muted">
        Sign in to <Link href="/admin" className="underline">admin</Link> to
        create one, or run the seed SQL.
      </p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-accent">
      <strong>Couldn&apos;t load modules.</strong> {message}
      <p className="mt-2 text-xs text-muted">
        Make sure your <code>.env.local</code> is set and the SQL schema has run.
      </p>
    </div>
  );
}
