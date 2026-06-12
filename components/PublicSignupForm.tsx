"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Phase = "form" | "done";

export default function PublicSignupForm() {
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedMagic, setUsedMagic] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Pick a password with at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setUsedMagic(false);
    setPhase("done");
  }

  async function onMagicLink() {
    setError(null);
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    setMagicLoading(true);
    const supabase = createClient();
    // signInWithOtp creates the user if needed, then emails a link that
    // logs them in (no password required).
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setMagicLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setUsedMagic(true);
    setPhase("done");
  }

  if (phase === "done") {
    return (
      <div className="space-y-3 text-sm">
        <p className="rounded-md border border-green-600/30 bg-green-50 px-3 py-3 text-green-800">
          {usedMagic
            ? "Magic link sent. Open it from your inbox to finish signing in."
            : "Check your email — we sent you a confirmation link. Open it to activate your account."}
        </p>
        <p className="text-muted">
          Wrong address?{" "}
          <button
            type="button"
            onClick={() => setPhase("form")}
            className="text-ink underline-offset-2 hover:underline"
          >
            Go back
          </button>
          .
        </p>
      </div>
    );
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
          autoComplete="new-password"
          minLength={8}
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>

      {error && (
        <p className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading || magicLoading}
          className="btn-primary w-full"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={onMagicLink}
          disabled={loading || magicLoading}
          className="btn-outline w-full"
        >
          {magicLoading ? "Sending…" : "Or use a magic link"}
        </button>
      </div>
    </form>
  );
}
