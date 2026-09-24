"use client";

import ErrorState from "@/components/prestocks/ErrorState";

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4">
      <ErrorState
        title="Unable to load Comparison Data"
        message="A network or upstream error occurred while loading PreStocks assets for comparison."
        error={error}
        onRetry={reset}
      />
    </div>
  );
}
