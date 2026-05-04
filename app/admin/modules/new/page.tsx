import Link from "next/link";
import ModuleForm from "@/components/ModuleForm";

export const dynamic = "force-dynamic";

export default function NewModulePage() {
  return (
    <section className="mx-auto max-w-xl">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">New module</h1>
      <div className="mt-6 rounded-lg border border-border bg-white p-6 shadow-card">
        <ModuleForm mode="create" />
      </div>
    </section>
  );
}
