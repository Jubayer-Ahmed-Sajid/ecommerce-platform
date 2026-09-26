export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="ml-auto h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-7 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
