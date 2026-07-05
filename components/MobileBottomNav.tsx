"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import QuickAddCardModal from "@/components/QuickAddCardModal";

/**
 * Mobile-only sticky bottom navigation. Three slots:
 *
 *   [Home]  ( + Add card )  [Reviews]
 *
 * The center button is raised (translated up), orange-accent, and
 * launches the QuickAddCardModal — the primary "capture a word"
 * action any time the user is browsing the app.
 *
 * VISIBILITY — visible on menu / navigation screens, hidden on the
 * focused study screens. Rules keyed on `usePathname()`:
 *
 *   Visible on:
 *     /                                    (home)
 *     /reviews                             (My Reviews)
 *     /reviews/decks/[deckId]              (deck detail)
 *     /modules                             (module list, if it exists)
 *     /modules/[slug]                      (level list)
 *
 *   Hidden on:
 *     /modules/[slug]/[levelId]            (a running flashcard/quiz)
 *     /reviews/decks/[deckId]/review       (a running custom-deck review)
 *     /login  /signup  /auth/*             (auth surfaces)
 *     /admin/*                             (admin surfaces)
 *
 * The nav also owns the QuickAddCardModal so it can live once at the
 * layout level rather than being remounted per page.
 *
 * Content padding — `pb-[calc(theme(spacing.16)+env(safe-area-inset-bottom))]`
 * on <main> keeps content from hiding under the bar. The bar itself
 * respects iOS safe-area-inset-bottom on notched devices.
 */

const NAV_HEIGHT_PX = 64;

function shouldShow(pathname: string): boolean {
  // Never on the focused study surfaces.
  //   /modules/<slug>/<levelId>
  //   /reviews/decks/<deckId>/review
  //   /reviews/decks/<deckId>/session
  if (/^\/modules\/[^/]+\/[^/]+/.test(pathname)) return false;
  if (/^\/reviews\/decks\/[^/]+\/review/.test(pathname)) return false;
  if (/^\/reviews\/decks\/[^/]+\/session/.test(pathname)) return false;

  // Auth + admin — different UX, no shortcut needed.
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/signup")) return false;
  if (pathname.startsWith("/auth")) return false;
  if (pathname.startsWith("/admin")) return false;

  // Visible on everything else that's a "navigation" screen — home,
  // /reviews, /modules, /modules/<slug>, /reviews/decks/<deckId>.
  return true;
}

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const [quickOpen, setQuickOpen] = useState(false);

  if (!shouldShow(pathname)) return null;

  const isHome = pathname === "/";
  const isReviews = pathname.startsWith("/reviews");

  return (
    <>
      {/* Sticky bar — mobile only. `sm:hidden` matches the existing
          mobile-vs-desktop split used by MobileNav. */}
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(15,23,42,0.04)] sm:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          height: `calc(${NAV_HEIGHT_PX}px + env(safe-area-inset-bottom))`,
        }}
      >
        <ul className="grid h-full grid-cols-3 items-center">
          {/* LEFT — Home */}
          <li className="flex justify-center">
            <Link
              href="/"
              aria-current={isHome ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                isHome ? "text-primary" : "text-muted hover:text-primary"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 11l9-8 9 8" />
                <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
              </svg>
              <span>Home</span>
            </Link>
          </li>

          {/* CENTER — raised Add card (primary CTA) */}
          <li className="flex justify-center">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              aria-label="Add card"
              className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary shadow-glow ring-4 ring-white transition hover:brightness-105 active:scale-95"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </li>

          {/* RIGHT — Reviews */}
          <li className="flex justify-center">
            <Link
              href="/reviews"
              aria-current={isReviews ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                isReviews ? "text-primary" : "text-muted hover:text-primary"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 5.5L12 16l-5 3 1-5.5-4-4 5.5-1z" />
              </svg>
              <span>Reviews</span>
            </Link>
          </li>
        </ul>
      </nav>

      <QuickAddCardModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </>
  );
}
