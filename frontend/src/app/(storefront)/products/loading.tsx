export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-pulse">
      {/* Filter skeleton */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="aspect-square w-full rounded-xl bg-slate-200 dark:bg-slate-800 mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
