"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
  initialError?: string | null;
};

const ERROR_LABELS: Record<string, string> = {
  callback_failed:
    "We couldn't complete sign-in from that link. Please try again.",
};

export default function PublicLoginForm({
  next = "/",
  initialError,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError ? ERROR_LABELS[initialError] ?? initialError : null
  );
  const [magicSent, setMagicSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMagicSent(false);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onMagicLink() {
    setError(null);
    setMagicSent(false);
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    setMagicLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setMagicLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMagicSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mt-1"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mt-1"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}
      {magicSent && !error && (
        <p className="rounded-md border border-green-600/30 bg-green-50 px-3 py-2 text-sm text-green-800">
          Magic link sent. Check your email — opening the link will sign you in.
        </p>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading || magicLoading}
          className="btn-primary w-full"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
        <button
          type="button"
          onClick={onMagicLink}
          disabled={loading || magicLoading}
          className="btn-outline w-full"
        >
          {magicLoading ? "Sending…" : "Send me a magic link instead"}
        </button>
      </div>
    </form>
  );
}
