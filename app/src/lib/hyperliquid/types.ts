/** XYZ DEX asset metadata from the `meta` endpoint. */
export interface AssetMeta {
  /** Full coin name (e.g. "xyz:TSLA"). */
  name: string;
  /** Number of decimal places for size formatting. */
  szDecimals: number;
  /** Maximum leverage allowed. */
  maxLeverage: number;
  /** Hyperliquid asset ID used as `a` in order actions. Includes builder-dex offsets when applicable. */
  assetIndex: number;
}

/** Time-in-force for limit orders. */
export type TimeInForce = "Gtc" | "Ioc" | "Alo" | "FrontendMarket";

/** Order parameters before signing. */
export interface OrderParams {
  /** Display symbol (e.g. "TSLA"). */
  symbol: string;
  /** true = long/buy, false = short/sell. */
  isBuy: boolean;
  /** Order price in USD. */
  price: number;
  /** Order size in base asset units. */
  size: number;
  /** Reduce-only flag. */
  reduceOnly: boolean;
  /** Time-in-force. */
  tif: TimeInForce;
}

/** ECDSA signature components for Hyperliquid. */
export interface HlSignature {
  r: `0x${string}`;
  s: `0x${string}`;
  v: number;
}

/** Successful order response status. */
export interface OrderFilled {
  filled: {
    totalSz: string;
    avgPx: string;
    oid: number;
  };
}

/** Resting order response status. */
export interface OrderResting {
  resting: {
    oid: number;
  };
}

/** Individual status from order response. */
export type OrderStatus =
  | OrderFilled
  | OrderResting
  | { error: string }
  | "waitingForFill"
  | "waitingForTrigger";

/** Order placement response from Hyperliquid. */
export interface OrderResponse {
  status: "ok";
  response: {
    type: "order";
    data: {
      statuses: OrderStatus[];
    };
  };
}

/** Error response from Hyperliquid. */
export interface ErrorResponse {
  status: "err";
  response: string;
}

/** Union of possible exchange API responses. */
export type ExchangeResponse = OrderResponse | ErrorResponse;

/** User position from clearinghouse state. */
export interface UserPosition {
  coin: string;
  szi: string;
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  liquidationPx: string | null;
  marginUsed: string;
  leverage: { type: string; value: number };
  returnOnEquity: string;
}

/** User open order. */
export interface UserOrder {
  oid: number;
  coin: string;
  side: "A" | "B";
  limitPx: string;
  sz: string;
  timestamp: number;
  origSz: string;
}

/** Account margin summary. */
export interface MarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}

/** Full user state from the info endpoint. */
export interface UserState {
  assetPositions: { position: UserPosition }[];
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
}
