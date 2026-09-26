export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 w-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
