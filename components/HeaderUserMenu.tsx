"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side user menu rendered in the root layout. Subscribes to
 * Supabase auth state, so it stays in sync after sign-in / sign-out
 * without forcing the rest of the layout to be dynamic.
 *
 *  - Logged out  → small "Log in" link.
 *  - Logged in   → email + sign-out button.
 *  - Unresolved  → renders nothing (avoids the "Log in" flash on first
 *                  paint for already-authenticated users).
 */
export default function HeaderUserMenu() {
  const router = useRouter();
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "anon" } | { kind: "user"; email: string }
  >({ kind: "loading" });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setState(user ? { kind: "user", email: user.email ?? "" } : { kind: "anon" });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setState(u ? { kind: "user", email: u.email ?? "" } : { kind: "anon" });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  }

  if (state.kind === "loading") {
    // Reserve space silently — avoids layout shift when state resolves.
    return <span className="inline-block w-12" aria-hidden />;
  }

  if (state.kind === "anon") {
    return (
      <Link href="/login" className="hover:text-ink">
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="max-w-[180px] truncate text-xs text-muted"
        title={state.email}
      >
        {state.email}
      </span>
      <button
        onClick={logout}
        disabled={loggingOut}
        className="rounded-md px-2 py-1 text-xs text-muted hover:bg-soft hover:text-ink disabled:opacity-50"
      >
        {loggingOut ? "…" : "Log out"}
      </button>
    </div>
  );
}
