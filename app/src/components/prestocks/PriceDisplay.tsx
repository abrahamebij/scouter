import { formatCurrency } from "@/lib/prestocks/format";

interface PriceDisplayProps {
  tokenPrice: number;
  markPrice: number;
  compact?: boolean;
}

export default function PriceDisplay({
  tokenPrice,
  markPrice,
  compact = false,
}: PriceDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-on-surface font-mono font-semibold">
          {formatCurrency(tokenPrice)}
        </span>
        <span className="text-on-surface-variant font-mono text-[11px]">
          Mark: {formatCurrency(markPrice)}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
      <div>
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
          Token Price
        </div>
        <div className="text-lg font-headline font-bold text-on-surface font-mono">
          {formatCurrency(tokenPrice)}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
          Mark Price
        </div>
        <div className="text-lg font-headline font-bold text-on-surface-variant font-mono">
          {formatCurrency(markPrice)}
        </div>
      </div>
    </div>
  );
}
