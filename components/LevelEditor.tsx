"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ScriptType } from "@/lib/types";

type Level = {
  id: string;
  name: string;
  script: ScriptType;
  order_index: number;
};

type Card = {
  id: string;
  fields: Record<string, string>;
  created_at: string;
};

// Same regex as supabase/migrate_script_field.sql so admin and DB stay in sync.
const KATAKANA_RE = /[゠-ヿ]/;

function detectScript(japanese: string): "hiragana" | "katakana" {
  return KATAKANA_RE.test(japanese) ? "katakana" : "hiragana";
}

export default function LevelEditor({
  moduleType,
  level,
  cards,
}: {
  moduleType: "quiz" | "conjugation";
  level: Level;
  cards: Card[];
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Level details
        </h2>
        <LevelDetails level={level} />
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Add card
        </h2>
        <AddCardForm levelId={level.id} moduleType={moduleType} />
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Bulk import
        </h2>
        <BulkImport levelId={level.id} moduleType={moduleType} />
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Cards ({cards.length})
        </h2>
        <CardsTable moduleType={moduleType} cards={cards} />
      </div>
    </div>
  );
}

function LevelDetails({ level }: { level: Level }) {
  const router = useRouter();
  const [name, setName] = useState(level.name);
  const [script, setScript] = useState<ScriptType>(level.script);
  const [orderIndex, setOrderIndex] = useState<number>(level.order_index ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("module_levels")
      .update({ name: name.trim(), script, order_index: orderIndex })
      .eq("id", level.id);
    setLoading(false);
    if (error) return setError(error.message);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <label className="label">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
      <div>
        <label className="label">Order</label>
        <input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
          className="input mt-1"
        />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
      {error && (
        <p className="sm:col-span-3 text-sm text-accent">{error}</p>
      )}
      {saved && !error && (
        <p className="sm:col-span-3 text-sm text-green-700">Saved.</p>
      )}
    </form>
  );
}

function AddCardForm({
  levelId,
  moduleType,
}: {
  levelId: string;
  moduleType: "quiz" | "conjugation";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [script, setScript] = useState<"hiragana" | "katakana">("hiragana");
  const [scriptManual, setScriptManual] = useState(false);

  function onJapaneseChange(v: string) {
    setB(v);
    if (!scriptManual) setScript(detectScript(v));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fields =
      moduleType === "quiz"
        ? { english: a.trim(), japanese: b.trim(), script }
        : { verb: a.trim(), form: b.trim(), answer: c.trim() };
    const supabase = createClient();
    const { error } = await supabase
      .from("cards")
      .insert({ level_id: levelId, fields });
    setLoading(false);
    if (error) return setError(error.message);
    setA("");
    setB("");
    setC("");
    setScript("hiragana");
    setScriptManual(false);
    router.refresh();
  }

  return (
    <form onSubmit={add} className="grid gap-3 sm:grid-cols-4">
      {moduleType === "quiz" ? (
        <>
          <div className="sm:col-span-2">
            <label className="label">English</label>
            <input
              required
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="input mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Japanese</label>
            <input
              required
              value={b}
              onChange={(e) => onJapaneseChange(e.target.value)}
              className="input mt-1 jp"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Script</label>
            <select
              value={script}
              onChange={(e) => {
                setScriptManual(true);
                setScript(e.target.value as "hiragana" | "katakana");
              }}
              className="input mt-1"
            >
              <option value="hiragana">hiragana</option>
              <option value="katakana">katakana</option>
            </select>
            <p className="mt-1 text-xs text-muted">
              {scriptManual
                ? "Set manually."
                : "Auto-detected from Japanese — change if needed."}
            </p>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="label">Verb</label>
            <input
              required
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="input mt-1 jp"
            />
          </div>
          <div>
            <label className="label">Form</label>
            <input
              required
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="input mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Answer</label>
            <input
              required
              value={c}
              onChange={(e) => setC(e.target.value)}
              className="input mt-1 jp"
            />
          </div>
        </>
      )}
      <div className="sm:col-span-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Adding…" : "Add card"}
        </button>
      </div>
      {error && (
        <p className="sm:col-span-4 text-sm text-accent">{error}</p>
      )}
    </form>
  );
}

function BulkImport({
  levelId,
  moduleType,
}: {
  levelId: string;
  moduleType: "quiz" | "conjugation";
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const placeholder =
    moduleType === "quiz"
      ? "english,japanese\nrain,あめ\ngood,いい"
      : "verb,form,answer\n食べる,polite,食べます";

  async function importLines() {
    setError(null);
    setSuccess(null);
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));
    if (lines.length === 0) {
      setError("Nothing to import.");
      return;
    }

    const rows: { level_id: string; fields: Record<string, string> }[] = [];
    for (const [i, line] of lines.entries()) {
      const parts = splitCsv(line);
      if (moduleType === "quiz") {
        if (parts.length < 2) {
          setError(`Line ${i + 1}: expected "english,japanese"`);
          return;
        }
        const japanese = parts[1];
        rows.push({
          level_id: levelId,
          fields: {
            english: parts[0],
            japanese,
            // Auto-detect script from the Japanese text.
            script: detectScript(japanese),
          },
        });
      } else {
        if (parts.length < 3) {
          setError(`Line ${i + 1}: expected "verb,form,answer"`);
          return;
        }
        rows.push({
          level_id: levelId,
          fields: { verb: parts[0], form: parts[1], answer: parts[2] },
        });
      }
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("cards").insert(rows);
    setLoading(false);
    if (error) return setError(error.message);
    setSuccess(`Imported ${rows.length} cards.`);
    setText("");
    router.refresh();
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted">
        Paste one card per line. Format:{" "}
        <code className="rounded bg-soft px-1.5 py-0.5">
          {moduleType === "quiz" ? "english,japanese" : "verb,form,answer"}
        </code>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="input font-mono text-sm"
      />
      <div className="mt-3 flex items-center gap-3">
        <button onClick={importLines} disabled={loading} className="btn-primary">
          {loading ? "Importing…" : "Import"}
        </button>
        {error && <span className="text-sm text-accent">{error}</span>}
        {success && <span className="text-sm text-green-700">{success}</span>}
      </div>
    </div>
  );
}

function CardsTable({
  moduleType,
  cards,
}: {
  moduleType: "quiz" | "conjugation";
  cards: Card[];
}) {
  const router = useRouter();

  async function update(id: string, fields: Record<string, string>) {
    const supabase = createClient();
    const { error } = await supabase.from("cards").update({ fields }).eq("id", id);
    if (error) alert(error.message);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this card?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }

  if (cards.length === 0)
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
        No cards yet — add one above.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted">
          {moduleType === "quiz" ? (
            <tr>
              <th className="px-2 py-2">English</th>
              <th className="px-2 py-2">Japanese</th>
              <th className="px-2 py-2">Script</th>
              <th></th>
            </tr>
          ) : (
            <tr>
              <th className="px-2 py-2">Verb</th>
              <th className="px-2 py-2">Form</th>
              <th className="px-2 py-2">Answer</th>
              <th></th>
            </tr>
          )}
        </thead>
        <tbody className="divide-y divide-border">
          {cards.map((c) => (
            <CardRow
              key={c.id}
              card={c}
              moduleType={moduleType}
              onSave={(fields) => update(c.id, fields)}
              onDelete={() => remove(c.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardRow({
  card,
  moduleType,
  onSave,
  onDelete,
}: {
  card: Card;
  moduleType: "quiz" | "conjugation";
  onSave: (fields: Record<string, string>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [a, setA] = useState(
    moduleType === "quiz" ? card.fields.english ?? "" : card.fields.verb ?? ""
  );
  const [b, setB] = useState(
    moduleType === "quiz" ? card.fields.japanese ?? "" : card.fields.form ?? ""
  );
  const [c, setC] = useState(card.fields.answer ?? "");
  const initialScript: "hiragana" | "katakana" =
    card.fields.script === "katakana" ? "katakana" : "hiragana";
  const [script, setScript] = useState<"hiragana" | "katakana">(initialScript);
  const [scriptManual, setScriptManual] = useState(false);

  function onJapaneseChange(v: string) {
    setB(v);
    if (!scriptManual) setScript(detectScript(v));
  }

  if (!editing) {
    return (
      <tr className="hover:bg-soft/50">
        {moduleType === "quiz" ? (
          <>
            <td className="px-2 py-2">{card.fields.english}</td>
            <td className="jp px-2 py-2">{card.fields.japanese}</td>
            <td className="px-2 py-2 text-xs text-muted">
              {card.fields.script ?? "—"}
            </td>
          </>
        ) : (
          <>
            <td className="jp px-2 py-2">{card.fields.verb}</td>
            <td className="px-2 py-2">{card.fields.form}</td>
            <td className="jp px-2 py-2">{card.fields.answer}</td>
          </>
        )}
        <td className="px-2 py-2 text-right">
          <button onClick={() => setEditing(true)} className="btn-ghost">
            Edit
          </button>
          <button onClick={onDelete} className="btn-ghost text-accent">
            Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      {moduleType === "quiz" ? (
        <>
          <td className="px-2 py-2">
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="input"
            />
          </td>
          <td className="px-2 py-2">
            <input
              value={b}
              onChange={(e) => onJapaneseChange(e.target.value)}
              className="input jp"
            />
          </td>
          <td className="px-2 py-2">
            <select
              value={script}
              onChange={(e) => {
                setScriptManual(true);
                setScript(e.target.value as "hiragana" | "katakana");
              }}
              className="input"
            >
              <option value="hiragana">hiragana</option>
              <option value="katakana">katakana</option>
            </select>
          </td>
        </>
      ) : (
        <>
          <td className="px-2 py-2">
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="input jp"
            />
          </td>
          <td className="px-2 py-2">
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="input"
            />
          </td>
          <td className="px-2 py-2">
            <input
              value={c}
              onChange={(e) => setC(e.target.value)}
              className="input jp"
            />
          </td>
        </>
      )}
      <td className="px-2 py-2 text-right">
        <button
          onClick={() => {
            const fields: Record<string, string> =
              moduleType === "quiz"
                ? { english: a.trim(), japanese: b.trim(), script }
                : { verb: a.trim(), form: b.trim(), answer: c.trim() };
            onSave(fields);
            setEditing(false);
          }}
          className="btn-primary"
        >
          Save
        </button>
        <button onClick={() => setEditing(false)} className="btn-ghost">
          Cancel
        </button>
      </td>
    </tr>
  );
}

function splitCsv(line: string): string[] {
  // Splits on commas that aren't inside double quotes.
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}
