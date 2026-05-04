import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Admin — Nihongo" };

export default function AdminLoginPage() {
  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-2 text-muted">Sign in to manage modules.</p>
      <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-card">
        <LoginForm />
      </div>
    </section>
  );
}
