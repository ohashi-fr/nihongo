"use client";

/**
 * Star/bookmark button used to add or remove a card from the user's
 * favorites list. Self-contained presentation — the *parent* owns the
 * favorited-state for the surrounding deck and provides the toggle
 * callback so multiple instances stay in sync.
 *
 * Rendered as `null` when there is no logged-in user. Designed to sit
 * in the top-right corner of a flip card; uses `e.stopPropagation()`
 * so the click never reaches the flip handler underneath.
 */

type Props = {
  isFavorite: boolean;
  onToggle: () => void;
  /** Render nothing when the user isn't signed in. */
  loggedIn: boolean;
  className?: string;
  size?: "sm" | "md";
};

export default function FavoriteStar({
  isFavorite,
  onToggle,
  loggedIn,
  className = "",
  size = "md",
}: Props) {
  if (!loggedIn) return null;

  const fontSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isFavorite ? "Remove from reviews" : "Add to reviews"}
      aria-pressed={isFavorite}
      title={isFavorite ? "Remove from reviews" : "Add to reviews"}
      className={`inline-flex items-center justify-center rounded-md p-1.5 leading-none transition hover:bg-soft/60 ${fontSize} ${
        isFavorite ? "text-[#eab308]" : "text-muted hover:text-ink"
      } ${className}`}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
