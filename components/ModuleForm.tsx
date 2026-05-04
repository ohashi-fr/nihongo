"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  type?: "quiz" | "conjugation";
};

export default function ModuleForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<"quiz" | "conjugation">(
    initial?.type ?? "quiz"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(v: string) {
    if (mode === "create" && (slug === "" || slug === slugify(name))) {
      setSlug(slugify(v));
    }
    setName(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      type,
    };
    if (mode === "create") {
      const { data, error } = await supabase
        .from("modules")
        .insert(payload)
        .select("id")
        .single();
      setLoading(false);
      if (error) return setError(error.message);
      router.push(`/admin/modules/${data!.id}`);
      router.refresh();
    } else {
      const { error } = await supabase
        .from("modules")
        .update(payload)
        .eq("id", initial!.id!);
      setLoading(false);
      if (error) return setError(error.message);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Name</label>
        <input
          required
          value={name}
          onChange={(e) => autoSlug(e.target.value)}
          className="input mt-1"
        />
      </div>
      <div>
        <label className="label">Slug</label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input mt-1"
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          className="input mt-1"
          rows={3}
        />
      </div>
      <div>
        <label className="label">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "quiz" | "conjugation")}
          className="input mt-1"
        >
          <option value="quiz">quiz</option>
          <option value="conjugation">conjugation</option>
        </select>
      </div>
      {error && (
        <p className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : mode === "create" ? "Create module" : "Save"}
        </button>
      </div>
    </form>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
