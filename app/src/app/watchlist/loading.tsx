import SkeletonCard from "@/components/prestocks/SkeletonCard";

export default function WatchlistLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="h-4 bg-surface-container-high rounded w-32" />
        <div className="h-10 bg-surface-container-high rounded w-64" />
        <div className="h-4 bg-surface-container-high/60 rounded w-full max-w-lg" />
      </div>

      <div className="h-16 bg-surface-container-low/70 rounded-2xl border border-outline-variant/15" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
