"use client";

import ErrorState from "@/components/prestocks/ErrorState";

export default function MarketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4">
      <ErrorState
        title="Unable to load Market Terminal"
        message="An error occurred while loading this market from the PreStocks protocol."
        error={error}
        onRetry={reset}
      />
    </div>
  );
}
