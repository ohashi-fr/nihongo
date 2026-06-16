"use client";

import { useEffect, useState } from "react";
import SignupPromptModal from "@/components/SignupPromptModal";

/**
 * Star/bookmark button used to add or remove a card from the user's
 * favorites list.
 *
 * The star is *always* visible — even for logged-out visitors — to
 * make the favorites feature discoverable. Tap behaviour depends on
 * the auth state:
 *
 *   - signed-in  → calls `onToggle` (parent persists to `favorites`)
 *   - signed-out → opens `SignupPromptModal`; nothing is favorited
 *
 * On its first mount per device the component also pops a small
 * tooltip beside the star — "Tap the star to save a card to your
 * reviews ⭐" — so newcomers find the feature. The seen-state lives
 * in `localStorage` under `seen_star_tooltip` and is set immediately
 * when the tooltip first appears so it never shows again, even if
 * the user mounts a new flashcard right away.
 *
 * `e.stopPropagation()` is used on the button click and on tooltip
 * interactions so taps never reach the flip-card handler underneath.
 */

type Props = {
  isFavorite: boolean;
  onToggle: () => void;
  /** Auth state — drives the tap behaviour (toggle vs. modal). */
  loggedIn: boolean;
  className?: string;
  size?: "sm" | "md";
};

const TOOLTIP_KEY = "seen_star_tooltip";

export default function FavoriteStar({
  isFavorite,
  onToggle,
  loggedIn,
  className = "",
  size = "md",
}: Props) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [nextHref, setNextHref] = useState<string | undefined>(undefined);

  // First-time tooltip — set the flag *as we open it* so a second
  // mount (e.g. user immediately clicks Next) doesn't re-show it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(TOOLTIP_KEY);
      if (seen === "true") return;
      window.localStorage.setItem(TOOLTIP_KEY, "true");
      setTooltipOpen(true);
      const id = window.setTimeout(() => setTooltipOpen(false), 6000);
      return () => window.clearTimeout(id);
    } catch {
      /* localStorage unavailable (private mode etc.) — silently skip. */
    }
  }, []);

  // Snapshot the current URL so signup/login can redirect back here.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setNextHref(window.location.pathname + window.location.search);
  }, []);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setTooltipOpen(false);
    if (!loggedIn) {
      setPromptOpen(true);
      return;
    }
    onToggle();
  }

  const fontSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          aria-label={isFavorite ? "Remove from reviews" : "Add to reviews"}
          aria-pressed={isFavorite}
          title={isFavorite ? "Remove from reviews" : "Add to reviews"}
          className={`inline-flex items-center justify-center rounded-md p-1.5 leading-none transition hover:bg-soft/60 ${fontSize} ${
            isFavorite ? "text-[#eab308]" : "text-muted hover:text-ink"
          } ${className}`}
        >
          {isFavorite ? "★" : "☆"}
        </button>

        {tooltipOpen && (
          <div
            role="tooltip"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full z-20 mt-2 w-56"
          >
            {/* Pointer triangle — points up to the star. CSS-only via
                border tricks, no extra SVG markup needed. */}
            <div
              aria-hidden
              className="ml-auto mr-3 h-0 w-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "6px solid #051D48",
              }}
            />
            <div className="rounded-2xl bg-primary p-3 text-xs text-white shadow-cardHover">
              <div className="flex items-start gap-2">
                <p className="flex-1 leading-snug">
                  Tap the star to save a card to your reviews{" "}
                  <span aria-hidden>⭐</span>
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTooltipOpen(false);
                  }}
                  aria-label="Dismiss tooltip"
                  className="-mr-1 -mt-0.5 rounded-md px-1 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SignupPromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        next={nextHref}
      />
    </>
  );
}
