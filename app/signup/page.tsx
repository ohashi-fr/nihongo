import Link from "next/link";
import PublicSignupForm from "@/components/PublicSignupForm";

export const metadata = { title: "Sign up — Nihongo" };

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-muted">
        An account isn&apos;t required for browsing — it&apos;s only used for
        future review features (saved progress, spaced repetition, etc.).
      </p>
      <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-card">
        <PublicSignupForm />
      </div>
      <p className="mt-4 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline-offset-2 hover:underline">
          Log in
        </Link>
        .
      </p>
    </section>
  );
}
