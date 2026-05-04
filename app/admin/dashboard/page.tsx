import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DeleteModuleButton from "@/components/DeleteModuleButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select(
      "id, name, slug, type, description, module_levels(id, sessions(correct_first_try, total_cards))"
    )
    .order("created_at", { ascending: true });

  const stats = (modules ?? []).map((m: any) => {
    const sessions: { correct_first_try: number; total_cards: number }[] = [];
    for (const lv of m.module_levels ?? []) {
      for (const s of lv.sessions ?? []) sessions.push(s);
    }
    const totalSessions = sessions.length;
    const avgScore =
      totalSessions === 0
        ? null
        : Math.round(
            (sessions.reduce(
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
