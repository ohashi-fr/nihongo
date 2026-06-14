"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";

/**
 * Mobile-only navigation. Renders a small hamburger button in the
 * header; tapping it slides a panel in from the right with all nav
 * links plus the user identity / sign-in. Close on outside-tap,
 * Escape, the × button, or selecting a link.
 *
 * The desktop nav (HeaderUserMenu + inline links) is rendered
 * independently in the layout and hidden on mobile.
 */
export default function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "anon" } | { kind: "user"; email: string }
  >({ kind: "loading" });
  const [loggingOut, setLoggingOut] = useState(false);

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

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
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

  const initial =
    state.kind === "user" ? (state.email || "?").charAt(0).toUpperCase() : "";

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-soft"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="13" y2="16" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-primary-900/30 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-[100dvh] w-[86%] max-w-[320px] flex-col bg-white shadow-cardHover transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* User / sign-in section */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          {state.kind === "user" ? (
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
              >
                {initial}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                  Signed in as
                </div>
                <div
                  className="truncate text-sm font-medium text-ink"
                  title={state.email}
                >
                  {state.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">Guest</div>
                <div className="text-xs text-muted">Not signed in</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-ink"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            <NavItem
              href="/"
              label="Modules"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              }
              onSelect={() => setOpen(false)}
            />
            {/* My Reviews is always shown so the entry point is easy to
                find on mobile. Anonymous taps go through /login?next=. */}
            <NavItem
              href="/reviews"
              label="My Reviews"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 5.5L12 16l-5 3 1-5.5-4-4 5.5-1z" />
                </svg>
              }
              onSelect={() => setOpen(false)}
            />
            {/* Admin only visible to addresses listed in
                NEXT_PUBLIC_ADMIN_EMAILS. Hidden for anonymous users
                and for non-admin signed-in users. */}
            {state.kind === "user" && isAdminEmail(state.email) && (
              <NavItem
                href="/admin"
                label="Admin"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19 12a7 7 0 0 1-.2 1.6l1.7 1.3-2 3.5-2-.8a7 7 0 0 1-2.7 1.6l-.3 2.2h-4l-.3-2.2a7 7 0 0 1-2.7-1.6l-2 .8-2-3.5L4.2 13.6A7 7 0 0 1 4 12c0-.6.1-1.1.2-1.6L2.5 9.1l2-3.5 2 .8A7 7 0 0 1 9.2 4.8L9.5 2.6h4l.3 2.2a7 7 0 0 1 2.7 1.6l2-.8 2 3.5-1.7 1.3c.1.5.2 1 .2 1.6z" />
                  </svg>
                }
                onSelect={() => setOpen(false)}
              />
            )}
          </ul>
        </nav>

        {/* Footer action */}
        <div className="border-t border-border p-4">
          {state.kind === "user" ? (
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="btn-outline w-full justify-center disabled:opacity-50"
            >
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn-accent w-full justify-center"
            >
              Log in →
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon,
  onSelect,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onSelect}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink transition hover:bg-soft hover:text-primary"
      >
        <span aria-hidden className="text-primary">
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
