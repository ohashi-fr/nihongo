"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteModuleButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm(`Delete module "${name}"? This removes all its levels and cards.`))
      return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("modules").delete().eq("id", id);
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={onClick} disabled={loading} className="btn-ghost text-accent">
      {loading ? "…" : "Delete"}
    </button>
  );
}
