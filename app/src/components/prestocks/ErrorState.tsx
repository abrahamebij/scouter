"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Unable to load PreStocks data",
  message = "A network or upstream API error occurred while connecting to PreStocks. Please try again.",
  error,
  onRetry,
}: ErrorStateProps) {
  const errorMessage =
    typeof error === "string" ? error : error?.message || null;

  return (
    <div className="p-8 sm:p-12 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-4 max-w-lg mx-auto my-12 shadow-lg shadow-black/20">
      <div className="w-12 h-12 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
        <MaterialIcon icon="error_outline" size="md" />
      </div>

      <div className="space-y-1">
        <h2 className="font-headline font-semibold text-lg text-on-surface">
          {title}
        </h2>
        <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm mx-auto">
          {message}
        </p>
      </div>

      {errorMessage && (
        <div className="text-[11px] font-mono text-on-surface-variant/70 p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 break-all text-left">
          {errorMessage}
        </div>
      )}

      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors"
          >
            <MaterialIcon icon="refresh" size="sm" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
