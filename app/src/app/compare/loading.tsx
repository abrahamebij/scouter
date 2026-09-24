export default function CompareLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="h-4 bg-surface-container-high rounded w-32" />
        <div className="h-10 bg-surface-container-high rounded w-80" />
        <div className="h-4 bg-surface-container-high/60 rounded w-full max-w-xl" />
      </div>

      <div className="h-14 bg-surface-container-low/70 rounded-2xl border border-outline-variant/15" />

      <div className="h-96 bg-surface-container-low/50 rounded-2xl border border-outline-variant/15" />
    </div>
  );
}
