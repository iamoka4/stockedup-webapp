export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8" aria-busy="true" aria-live="polite">
      <div className="h-11 w-full animate-pulse rounded-full bg-brand-tint" />
      <p className="mt-6 text-sm text-ink-soft">Searching…</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-2xl border border-line bg-bg-raised p-3"
          >
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-brand-tint" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-3/4 animate-pulse rounded bg-brand-tint" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-brand-tint" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-brand-tint" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}