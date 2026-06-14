"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Desktop user menu rendered in the layout header. Subscribes to the
 * Supabase auth state and renders either a "Log in" link (anon) or a
 * "My Profile" button that opens a small dropdown containing the
 * user's email and a Log out action.
 *
 * Click-outside, Escape, and selecting an item all close the menu.
 */
export default function HeaderUserMenu() {
  const router = useRouter();
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "anon" } | { kind: "user"; email: string }
  >({ kind: "loading" });
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setState(
        user
          ? { kind: "user", email: user.email ?? "" }
          : { kind: "anon" }
      );
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setState(
        u ? { kind: "user", email: u.email ?? "" } : { kind: "anon" }
      );
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggingOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (state.kind === "loading") {
    // Reserve a touch of space to avoid layout shift on first paint.
    return <span className="inline-block w-20" aria-hidden />;
  }

  if (state.kind === "anon") {
    return (
      <Link
        href="/login"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-soft hover:text-primary"
      >
        Log in
      </Link>
    );
  }

  const initial = (state.email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium transition ${
          open
            ? "bg-soft text-primary"
            : "text-muted hover:bg-soft hover:text-primary"
        }`}
      >
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
        >
          {initial}
        </span>
        <span>My Profile</span>
        <span
          aria-hidden
          className={`text-[10px] transition ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-white p-1 shadow-card"
        >
          <div className="px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
              Signed in as
            </div>
            <div
              className="mt-0.5 truncate text-sm font-medium text-ink"
              title={state.email}
            >
              {state.email}
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition hover:bg-soft disabled:opacity-50"
          >
            <span aria-hidden>↩</span>
            <span>{loggingOut ? "Signing out…" : "Log out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
