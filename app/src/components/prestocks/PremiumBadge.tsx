import { formatPercentage } from "@/lib/prestocks/format";

interface PremiumBadgeProps {
  premiumPercent: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PremiumBadge({
  premiumPercent,
  size = "md",
  className = "",
}: PremiumBadgeProps) {
  const isPositive = premiumPercent > 0.001;
  const isNegative = premiumPercent < -0.001;

  let colorClasses = "bg-surface-container-high text-on-surface-variant border-outline-variant/30";
  if (isPositive) {
    colorClasses = "bg-primary/10 text-primary border-primary/25";
  } else if (isNegative) {
    colorClasses = "bg-secondary/10 text-secondary border-secondary/25";
  }

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded-md border tracking-tight ${colorClasses} ${sizeClasses} ${className}`}
      title="Token price difference relative to reference mark price"
    >
      <span>{formatPercentage(premiumPercent)}</span>
      <span className="text-[10px] font-sans opacity-75 uppercase">vs mark</span>
    </span>
  );
}
