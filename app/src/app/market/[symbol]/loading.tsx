export default function MarketLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <div className="h-9 bg-surface-container-high rounded-xl w-48" />
        <div className="flex items-center gap-2">
          <div className="h-8 bg-surface-container-high rounded-lg w-24" />
          <div className="h-8 bg-surface-container-high rounded-lg w-20" />
        </div>
      </div>

      {/* Main Terminal Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-32 bg-surface-container-low rounded-2xl border border-outline-variant/15" />
          <div className="h-72 bg-surface-container-low rounded-2xl border border-outline-variant/15" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-24 bg-surface-container-low rounded-xl border border-outline-variant/15"
              />
            ))}
          </div>
        </div>

        {/* Right Column: 4 cols */}
        <div className="lg:col-span-4">
          <div className="h-[480px] bg-surface-container-low rounded-2xl border border-outline-variant/15" />
        </div>
      </div>
    </div>
  );
}
