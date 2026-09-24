import type { QuoteAndPost } from "@cowprotocol/cow-sdk";

export type TradeMode = "perp" | "spot" | "earnings";

export type SwapStep =
  | "idle"
  | "quoting"
  | "checking-allowance"
  | "switch-chain"
  | "needs-approval"
  | "approving"
  | "ready"
  | "posting"
  | "submitted"
  | "error";

export interface SwapState {
  step: SwapStep;
  /** Estimated buy amount (formatted, e.g. "0.0265") */
  buyAmount: string;
  /** Raw buy amount as string from SDK */
  buyAmountRaw: string;
  /** Price per token in USDC */
  pricePerToken: number;
  /** Slippage in bps */
  slippageBps: number;
  /** Minimum received after slippage */
  minReceived: string;
  /** CoW order ID after submission */
  orderId: string | null;
  /** Error message */
  error: string | null;
  /** The quote object from CoW SDK for posting */
  quoteAndPost: QuoteAndPost | null;
}

export type BridgeStatus =
  | "idle"
  | "quoting"
  | "confirming"
  | "executing"
  | "done"
  | "error";

export interface BridgeExecution {
  status: BridgeStatus;
  /** Current step description */
  message: string;
  /** Transaction hash on source chain */
  txHash: string | null;
  /** Error message */
  error: string | null;
}
