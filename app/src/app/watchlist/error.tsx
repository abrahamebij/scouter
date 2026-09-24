"use client";

import ErrorState from "@/components/prestocks/ErrorState";

export default function WatchlistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4">
      <ErrorState
        title="Unable to load Watchlist Data"
        message="A network or upstream error occurred while hydrating your saved assets with live PreStocks metrics."
        error={error}
        onRetry={reset}
      />
    </div>
  );
}
