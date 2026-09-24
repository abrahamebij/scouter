import { formatCompactValuation, formatCurrency } from "@/lib/prestocks/format";

interface ValuationDisplayProps {
  impliedValuation: number;
  markValuation: number;
  compact?: boolean;
}

export default function ValuationDisplay({
  impliedValuation,
  markValuation,
  compact = false,
}: ValuationDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="text-on-surface-variant font-label text-[11px] uppercase">
          Implied Val
        </span>
        <span
          className="text-on-surface font-mono font-medium"
          title={`Implied: ${formatCurrency(impliedValuation)} | Mark: ${formatCurrency(markValuation)}`}
        >
          {formatCompactValuation(impliedValuation)}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
      <div>
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
          Implied Valuation
        </div>
        <div
          className="text-lg font-headline font-bold text-on-surface font-mono"
          title={formatCurrency(impliedValuation)}
        >
          {formatCompactValuation(impliedValuation)}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
          Mark Valuation
        </div>
        <div
          className="text-lg font-headline font-bold text-on-surface-variant font-mono"
          title={formatCurrency(markValuation)}
        >
          {formatCompactValuation(markValuation)}
        </div>
      </div>
    </div>
  );
}
