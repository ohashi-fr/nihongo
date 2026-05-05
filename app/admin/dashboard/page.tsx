import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DeleteModuleButton from "@/components/DeleteModuleButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  // Fetch each table independently. Don't rely on PostgREST nested-embed joins
  // here — if a row has no levels yet, or if FK introspection has a hiccup,
  // an embedded query can silently drop the parent row. A flat query and a
  // manual aggregate guarantees every module in the table shows up.
  const [{ data: modules }, { data: levels }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("modules")
        .select("id, name, slug, type, description, created_at")
        .order("created_at", { ascending: true, nullsFirst: false }),
      supabase.from("module_levels").select("id, module_id"),
      supabase
        .from("sessions")
        .select("level_id, correct_first_try, total_cards"),
    ]);

  // level_id → module_id
  const levelToModule = new Map<string, string>();
  (levels ?? []).forEach((l: any) => levelToModule.set(l.id, l.module_id));

  // module_id → sessions[]
  const sessionsByModule = new Map<
    string,
    { correct_first_try: number; total_cards: number }[]
  >();
  (sessions ?? []).forEach((s: any) => {
    const moduleId = levelToModule.get(s.level_id);
    if (!moduleId) return;
    if (!sessionsByModule.has(moduleId)) sessionsByModule.set(moduleId, []);
    sessionsByModule.get(moduleId)!.push(s);
  });

  const stats = (modules ?? []).map((m: any) => {
    const list = sessionsByModule.get(m.id) ?? [];
    const totalSessions = list.length;
    const avgScore =
      totalSessions === 0
        ? null
        : Math.round(
            (list.reduce(
              (acc, s) =>
                acc +
                (s.total_cards > 0 ? s.correct_first_try / s.total_cards : 0),
              0
            ) /
              totalSessions) *
              100
          );
    return { id: m.id, totalSessions, avgScore };
  });

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted">Manage your modules and levels.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/modules/new" className="btn-primary">
            + New module
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">Module</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Sessions</th>
              <th className="px-5 py-3">Avg score</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(modules ?? []).map((m: any, i: number) => {
              const s = stats[i];
              return (
                <tr key={m.id} className="hover:bg-soft/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/modules/${m.id}`}
                      className="font-medium hover:underline"
                    >
                      {m.name}
                    </Link>
                    <div className="text-xs text-muted">/{m.slug}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge">{m.type}</span>
                  </td>
                  <td className="px-5 py-3">{s.totalSessions}</td>
                  <td className="px-5 py-3">
                    {s.avgScore === null ? "—" : `${s.avgScore}%`}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/modules/${m.id}`}
                        className="btn-ghost"
                      >
                        Edit
                      </Link>
                      <DeleteModuleButton id={m.id} name={m.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!modules || modules.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No modules yet — create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
