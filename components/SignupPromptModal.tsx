"use client";

import Link from "next/link";
import Modal from "@/components/ui/Modal";

/**
 * Small modal shown when a logged-out visitor taps the favorite star
 * on a flashcard. It pitches signing up and offers a log-in shortcut.
 *
 * Carries the current page (`next`) through to the auth pages so the
 * user lands back on the level they were studying. If `next` is not
 * provided, the auth pages fall back to their own defaults.
 */

type Props = {
  open: boolean;
  onClose: () => void;
  /** Path to redirect to after auth (e.g. `/modules/kanji/abc?mode=mix`). */
  next?: string;
};

export default function SignupPromptModal({ open, onClose, next }: Props) {
  const signupHref = next
    ? `/signup?next=${encodeURIComponent(next)}`
    : "/signup";
  const loginHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : "/login";

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Save card to favorites">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 rounded-full p-1.5 text-muted transition hover:bg-soft hover:text-ink"
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

      {/* Star icon */}
      <div className="flex justify-center">
        <div
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-3xl leading-none text-accent-700"
        >
          ★
        </div>
      </div>

      <h2 className="mt-4 text-center text-lg font-bold tracking-tight text-ink">
        Want to save this card to your favorites?
      </h2>
      <p className="mt-2 text-center text-sm text-muted">
        Create a free account to build your review deck.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={signupHref}
          onClick={onClose}
          className="btn-accent w-full justify-center"
        >
          Sign up — it&apos;s free
        </Link>
        <Link
          href={loginHref}
          onClick={onClose}
          className="btn-outline w-full justify-center"
        >
          Log in
        </Link>
      </div>
    </Modal>
  );
}
