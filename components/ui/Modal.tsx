"use client";

import { useEffect, useRef } from "react";

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
 * While open, Tab / Shift+Tab are trapped inside the dialog and focus
 * returns to the previously focused element on close.
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
  const dialogRef = useRef<HTMLDivElement>(null);

  // Esc closes; Tab is trapped; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const opener = document.activeElement as HTMLElement | null;

    function focusables(): HTMLElement[] {
      if (!dialog) return [];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    // Don't steal focus from a child that already grabbed it (autoFocus).
    if (dialog && !dialog.contains(document.activeElement)) {
      (focusables()[0] ?? dialog).focus();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (opener && document.contains(opener)) opener.focus();
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
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${size} rounded-3xl bg-white p-6 shadow-cardHover outline-none`}
      >
        {children}
      </div>
    </div>
  );
}
