export default function Loading() {
  return (
    <section>
      <div className="mb-6">
        <div className="h-4 w-32 animate-pulse rounded bg-soft" />
        <div className="mt-3 h-9 w-64 animate-pulse rounded bg-soft" />
      </div>
      <div className="mx-auto max-w-xl">
        <div className="h-72 animate-pulse rounded-lg border border-border bg-soft/40" />
      </div>
    </section>
  );
}
