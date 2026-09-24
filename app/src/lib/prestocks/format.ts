/**
 * Formats a number as a USD currency string with 2 decimal places.
 * Example: 160.2888 -> "$160.29"
 */
export function formatCurrency(value: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats large valuations into compact human-readable units ($B, $T, $M).
 * Example: 141807375452 -> "$141.8B"
 * Example: 1708218303627 -> "$1.71T"
 */
export function formatCompactValuation(value: number): string {
  if (value === undefined || value === null || Number.isNaN(value) || value === 0) {
    return "—";
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1e12) {
    return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  }
  return formatCurrency(value);
}

/**
 * Formats a percentage difference with sign and 2 decimal places.
 * Example: 2.41 -> "+2.41%"
 * Example: -1.84 -> "-1.84%"
 * Example: 0 -> "0.00%"
 */
export function formatPercentage(value: number, includeSign = true): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0.00%";
  }

  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Formats token supply with thousands separators and no decimal noise.
 * Example: 11805.817985464 -> "11,805.82"
 */
export function formatSupply(value: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Truncates a Solana address for clean UI display.
 * Example: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF" -> "Prew...rpgF"
 */
export function truncateAddress(address: string, startChars = 4, endChars = 4): string {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
