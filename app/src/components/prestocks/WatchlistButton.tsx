"use client";

import { useWatchlist } from "@/lib/prestocks/watchlist";
import { useToast } from "@/components/ui/Toast";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface WatchlistButtonProps {
  symbol: string;
  variant?: "icon" | "button";
  size?: "sm" | "md";
  className?: string;
}

export default function WatchlistButton({
  symbol,
  variant = "button",
  size = "md",
  className = "",
}: WatchlistButtonProps) {
  const { isInWatchlist, toggle, isLoaded } = useWatchlist();
  const { toast } = useToast();
  const active = isLoaded && isInWatchlist(symbol);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(symbol);
    if (added) {
      toast(`Added ${symbol} to watchlist`, "success");
    } else {
      toast(`Removed ${symbol} from watchlist`, "info");
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        title={active ? "Remove from watchlist" : "Add to watchlist"}
        className={`p-1.5 rounded-lg border transition-all ${
          active
            ? "bg-accent/10 border-accent/25 text-accent"
            : "bg-surface-container-high/60 border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50"
        } ${className}`}
      >
        <MaterialIcon
          icon={active ? "bookmark" : "bookmark_border"}
          size={size === "sm" ? "sm" : "md"}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-headline font-semibold transition-all ${
        active
          ? "bg-accent/10 border-accent/25 text-accent hover:bg-accent/15"
          : "bg-surface-container-high border-outline-variant/30 text-on-surface hover:border-outline/50 hover:bg-surface-container-highest"
      } ${className}`}
    >
      <MaterialIcon icon={active ? "bookmark" : "bookmark_border"} size="sm" />
      <span>{active ? "Saved in Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
}
