"use client";

import ErrorState from "@/components/prestocks/ErrorState";

export default function CompanyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4">
      <ErrorState
        title="Unable to load Company Data"
        message="An error occurred while fetching company metrics from the PreStocks API."
        error={error}
        onRetry={reset}
      />
    </div>
  );
}
