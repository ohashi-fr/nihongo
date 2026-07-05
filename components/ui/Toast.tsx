"use client";

import { useEffect } from "react";

/**
 * Minimal auto-dismissing toast. Renders a small chip fixed at the
 * bottom-center on mobile, bottom-right on desktop. Not a full
 * notification stack — one message at a time is enough for the
 * light acknowledgement UX we need (deck deleted, card updated).
 *
 * Controlled by the caller: pass `message` when you want it up,
 * `onDismiss` to be told when it should come down. The component
 * schedules a `duration`-ms timeout and calls onDismiss.
 */

type Props = {
  message: string | null;
  onDismiss: () => void;
  /** ms before auto-dismiss. Defaults to 2600. */
  duration?: number;
  /** Optional visual tone. Defaults to a neutral dark chip. */
  tone?: "default" | "success" | "danger";
};

export default function Toast({
  message,
  onDismiss,
  duration = 2600,
  tone = "default",
}: Props) {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(id);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const toneClasses =
    tone === "success"
      ? "bg-success-700 text-white"
      : tone === "danger"
        ? "bg-red-600 text-white"
        : "bg-primary text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-8 sm:right-8 sm:left-auto sm:justify-end"
    >
      <div
        className={`pointer-events-auto max-w-xs rounded-full px-4 py-2 text-sm font-semibold shadow-cardHover ${toneClasses}`}
      >
        {message}
      </div>
    </div>
  );
}
