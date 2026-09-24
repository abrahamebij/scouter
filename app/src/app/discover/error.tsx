"use client";

import ErrorState from "@/components/prestocks/ErrorState";

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4">
      <ErrorState
        title="Unable to load PreStocks Assets"
        message="A network or upstream API error occurred while connecting to the PreStocks API endpoint."
        error={error}
        onRetry={reset}
      />
    </div>
  );
}
