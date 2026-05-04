"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ScriptType } from "@/lib/types";

type Level = {
  id: string;
  name: string;
  script: ScriptType;
  order_index: number;
  cards: { id: string }[];
};

export default function LevelManager({
  moduleId,
  levels,
}: {
  moduleId: string;
  levels: Level[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [script, setScript] = useState<ScriptType>("both");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addLevel(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdding(true);
    const supabase = createClient();
    const nextOrder =
      levels.length === 0
        ? 1
        : Math.max(...levels.map((l) => l.order_index ?? 0)) + 1;
    const { error } = await supabase.from("module_levels").insert({
      module_id: moduleId,
      name: name.trim(),
      script,
      order_index: nextOrder,
    });
    setAdding(false);
    if (error) return setError(error.message);
    setName("");
    setScript("both");
    router.refresh();
  }

  async function deleteLevel(id: string, label: string) {
    if (!confirm(`Delete level "${label}" and all its cards?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("module_levels").delete().eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }

  async function move(id: string, dir: -1 | 1) {
    const i = levels.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= levels.length) return;
    const supabase = createClient();
    const a = levels[i];
    const b = levels[j];
    // Swap order_index between the two affected levels.
    await supabase
      .from("module_levels")
      .update({ order_index: b.order_index })
      .eq("id", a.id);
    await supabase
      .from("module_levels")
      .update({ order_index: a.order_index })
      .eq("id", b.id);
    router.refresh();
  }

  return (
    <div>
      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {levels.map((lv, i) => (
          <li key={lv.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  onClick={() => move(lv.id, -1)}
                  disabled={i === 0}
                  className="text-xs text-muted hover:text-ink disabled:opacity-30"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(lv.id, 1)}
                  disabled={i === levels.length - 1}
                  className="text-xs text-muted hover:text-ink disabled:opacity-30"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <div>
                <div className="font-medium">{lv.name}</div>
                <div className="text-xs text-muted">
                  {lv.script} · {lv.cards?.length ?? 0} cards
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/modules/${moduleId}/levels/${lv.id}`}
                className="btn-ghost"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteLevel(lv.id, lv.name)}
                className="btn-ghost text-accent"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {levels.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted">
            No levels yet.
          </li>
        )}
      </ul>

      <form
        onSubmit={addLevel}
        className="mt-4 flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-3"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="label">Level name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Niveau 1"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="label">Script</label>
          <select
            value={script}
            onChange={(e) => setScript(e.target.value as ScriptType)}
            className="input mt-1"
          >
            <option value="hiragana">hiragana</option>
            <option value="katakana">katakana</option>
            <option value="both">both</option>
            <option value="none">none</option>
          </select>
        </div>
        <button type="submit" disabled={adding} className="btn-primary">
          {adding ? "Adding…" : "Add level"}
        </button>
        {error && (
          <p className="basis-full text-sm text-accent">{error}</p>
        )}
      </form>
    </div>
  );
}
