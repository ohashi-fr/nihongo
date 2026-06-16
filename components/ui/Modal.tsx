"use client";

import { useEffect } from "react";

/**
 * Tiny generic modal primitive. Renders a centered card on top of a
 * blurred backdrop. Closes on:
 *   - Escape key
 *   - Click on the backdrop area (anything outside the card)
 *   - Whatever the caller wires up inside `children` (a × button, a CTA)
 *
 * The caller controls visibility via the `open` prop and supplies the
 * `onClose` handler. Body scroll is locked while the modal is open.
 *
 * Intentionally unopinionated about content — the caller renders the
 * full inner layout (icon, headline, CTAs, etc.) inside the card.
 */

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class for the card. Defaults to `max-w-sm`. */
  size?: string;
  /** Optional accessibility label for the dialog. */
  ariaLabel?: string;
};

export default function Modal({
  open,
  onClose,
  children,
  size = "max-w-sm",
  ariaLabel,
}: Props) {
  // Esc closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primary-900/40 p-4 backdrop-blur-[2px] transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${size} rounded-3xl bg-white p-6 shadow-cardHover`}
      >
        {children}
      </div>
    </div>
  );
}
