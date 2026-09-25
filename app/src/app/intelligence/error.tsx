"use client";

import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export default function IntelligenceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-error/10 text-error flex items-center justify-center">
        <MaterialIcon icon="error_outline" size="lg" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-headline font-bold text-lg text-on-surface">
          Intelligence Workspace Error
        </h2>
        <p className="text-xs text-on-surface-variant font-light">
          An unexpected error occurred while initializing the research workspace.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 transition-all"
        >
          Try Again
        </button>
        <Link
          href="/discover"
          className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-medium text-xs transition-colors border border-outline-variant/30"
        >
          Return to Discover
        </Link>
      </div>
    </div>
  );
}
