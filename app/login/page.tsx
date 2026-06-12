import Link from "next/link";
import PublicLoginForm from "@/components/PublicLoginForm";

export const metadata = { title: "Log in — Nihongo" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-muted">
        Welcome back. Logging in is only required for review features —
        modules, levels, and quizzes remain freely browseable.
      </p>
      <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-card">
        <PublicLoginForm
          next={searchParams.next ?? "/"}
          initialError={searchParams.error ?? null}
        />
      </div>
      <p className="mt-4 text-sm text-muted">
        No account yet?{" "}
        <Link href="/signup" className="text-ink underline-offset-2 hover:underline">
          Create one
        </Link>
        .
      </p>
    </section>
  );
}
