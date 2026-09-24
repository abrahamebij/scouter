/**
 * Price and size formatting for Hyperliquid order submission.
 *
 * Hyperliquid has specific rules:
 * - Prices: max 5 significant figures, max (6 - szDecimals) decimal places
 * - Sizes: exactly szDecimals decimal places, no trailing zeros beyond that
 */

const MAX_SIGNIFICANT_DIGITS = 5;
const MAX_TOTAL_DECIMALS = 6;

/**
 * Format a price for Hyperliquid order submission.
 * Follows the same rounding rules as the official SDK.
 */
export function formatPrice(price: number, szDecimals: number): string {
  if (price <= 0) throw new Error(`Price must be positive, got ${price}`);

  const maxDecimalPlaces = MAX_TOTAL_DECIMALS - szDecimals;

  const [intPart = "0", decPart = ""] = price.toString().split(".");
  if (!decPart || Number(decPart) === 0) return intPart;

  const sigIntPart = intPart.replace(/^0+/, "");
  const sigDecPart = decPart.replace(/0+$/, "");
  const totalSigDigits = sigIntPart.length + sigDecPart.length;

  let rounded = price.toString();
  if (totalSigDigits > MAX_SIGNIFICANT_DIGITS) {
    let roundTo = decPart.length - (totalSigDigits - MAX_SIGNIFICANT_DIGITS);
    if (roundTo < 0) roundTo = 0;
    rounded = price.toFixed(roundTo);
  }

  const [rInt = "0", rDec = ""] = rounded.split(".");
  if (!rDec || Number(rDec) === 0) return rInt;

  const trimmed = rDec.slice(0, maxDecimalPlaces);
  if (!trimmed || Number(trimmed) === 0) return rInt;

  // Strip trailing zeros
  let result = `${rInt}.${trimmed}`;
  while (result.endsWith("0")) {
    result = result.slice(0, -1);
  }
  return result;
}

/**
 * Format a size for Hyperliquid order submission.
 * Rounds to szDecimals, strips trailing zeros, handles -0.
 */
export function formatSize(size: number, szDecimals: number): string {
  const rounded = size.toFixed(szDecimals);
  let normalized = parseFloat(parseFloat(rounded).toFixed(szDecimals)).toString();
  if (normalized === "-0") normalized = "0";
  return normalized;
}

/**
 * Calculate the minimum order size for an asset.
 */
export function minOrderSize(szDecimals: number): number {
  return Math.pow(10, -szDecimals);
}
