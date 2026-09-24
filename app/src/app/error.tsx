"use client";

import ErrorState from "@/components/prestocks/ErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4">
      <ErrorState
        title="Application Error"
        message="An unexpected error occurred while loading Scouter. You can try refreshing the view."
        error={error}
        onRetry={reset}
      />
    </div>
  );
}
