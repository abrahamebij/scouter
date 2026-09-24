export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container/40 p-5 space-y-4 animate-pulse">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-surface-container-high/80 flex-shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-4 bg-surface-container-high/80 rounded w-3/4" />
          <div className="h-3 bg-surface-container-high/50 rounded w-1/3" />
        </div>
        <div className="w-7 h-7 rounded-lg bg-surface-container-high/60" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-outline-variant/10">
        <div className="space-y-1">
          <div className="h-2.5 bg-surface-container-high/60 rounded w-1/2" />
          <div className="h-5 bg-surface-container-high/80 rounded w-3/4" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 bg-surface-container-high/60 rounded w-1/2" />
          <div className="h-5 bg-surface-container-high/80 rounded w-3/4" />
        </div>
      </div>

      {/* Footer / Badge */}
      <div className="flex items-center justify-between pt-1">
        <div className="h-3.5 bg-surface-container-high/70 rounded w-1/3" />
        <div className="h-5 bg-surface-container-high/70 rounded-md w-24" />
      </div>
    </div>
  );
}
