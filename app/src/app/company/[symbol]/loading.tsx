export default function CompanyLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-surface-container-low/70 rounded-2xl border border-outline-variant/15 p-8 space-y-6">
        <div className="h-4 bg-surface-container-high rounded w-32" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-surface-container-high flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-8 bg-surface-container-high rounded w-64" />
            <div className="h-4 bg-surface-container-high/60 rounded w-48" />
          </div>
        </div>
        <div className="h-16 bg-surface-container-high/40 rounded-xl" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-surface-container-low/70 rounded-xl border border-outline-variant/15"
          />
        ))}
      </div>
    </div>
  );
}
