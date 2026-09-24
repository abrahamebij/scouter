/**
 * Order execution against the Hyperliquid XYZ DEX.
 *
 * Handles:
 * - Asset metadata lookup (szDecimals, assetIndex)
 * - Price/size formatting per HL rules
 * - L1 action signing via agent wallet
 * - Order submission to /exchange
 * - Position and order queries via /info
 */

import { encode as msgpackEncode } from "@msgpack/msgpack";
import { keccak256 } from "viem";
import type { PrivateKeyAccount } from "viem/accounts";
import { HL_CONFIG, toCoin } from "@/lib/config/hyperliquid";
import { getAssetMetaForSymbol } from "./meta";
import { formatPrice, formatSize } from "./formatting";
import type { BookLevel } from "./marketFill";
import { postExchangeAction, signSendAsset } from "./signing";
import type {
  OrderParams,
  OrderStatus,
  ExchangeResponse,
  HlSignature,
  UserState,
  UserOrder,
} from "./types";

const EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";
const INFO_URL = HL_CONFIG.API_URL;
const LEDGER_POLL_INTERVAL_MS = 2_000;
const LEDGER_POLL_ATTEMPTS = 15;
const MARKET_ORDER_SLIPPAGE = 0.03;

interface SendLedgerDelta extends Record<string, unknown> {
  type: "send";
  user: string;
  destination: string;
  sourceDex: string;
  destinationDex: string;
  token: string;
  amount: string;
  usdcValue: string;
  fee: string;
  nativeTokenFee: string;
  nonce: number;
  feeToken: string;
}

interface LedgerUpdate {
  time: number;
  hash: string;
  delta: {
    type: string;
    [key: string]: unknown;
  };
}

function toUint64BE(n: number): Uint8Array {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, BigInt(n), false);
  return new Uint8Array(buf);
}

function largeIntsToBigInt(val: unknown): unknown {
  if (typeof val === "number" && Number.isInteger(val) && (val >= 0x100000000 || val < -0x80000000)) {
    return BigInt(val);
  }
  if (Array.isArray(val)) return val.map(largeIntsToBigInt);
  if (typeof val === "object" && val !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) out[k] = largeIntsToBigInt(v);
    }
    return out;
  }
  return val;
}

function getMarketExecutionPrice(price: number, isBuy: boolean): number {
  return isBuy ? price * (1 + MARKET_ORDER_SLIPPAGE) : price * (1 - MARKET_ORDER_SLIPPAGE);
}

async function signWithAgent(
  agent: PrivateKeyAccount,
  action: Record<string, unknown>,
  nonce: number,
): Promise<HlSignature> {
  const actionBytes = msgpackEncode(largeIntsToBigInt(action));
  const nonceBytes = toUint64BE(nonce);
  const vaultMarker = new Uint8Array([0]);

  const combined = new Uint8Array(actionBytes.length + nonceBytes.length + vaultMarker.length);
  combined.set(actionBytes, 0);
  combined.set(nonceBytes, actionBytes.length);
  combined.set(vaultMarker, actionBytes.length + nonceBytes.length);

  const connectionId = keccak256(combined);

  const signature = await agent.signTypedData({
    domain: {
      name: "Exchange",
      version: "1",
      chainId: 1337,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types: {
      Agent: [
        { name: "source", type: "string" },
        { name: "connectionId", type: "bytes32" },
      ],
    },
    primaryType: "Agent",
    message: {
      source: "a",
      connectionId,
    },
  });

  const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  let v = parseInt(signature.slice(130, 132), 16);
  if (v === 0 || v === 1) v += 27;

  return { r, s, v };
}

async function postInfo<T>(body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid info request failed: ${response.status}`);
  }

  return response.json();
}

function isSendLedgerDelta(delta: LedgerUpdate["delta"]): delta is SendLedgerDelta {
  return delta.type === "send";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForLedgerSend(
  userAddress: string,
  matcher: (update: LedgerUpdate) => boolean,
): Promise<LedgerUpdate | null> {
  for (let attempt = 0; attempt < LEDGER_POLL_ATTEMPTS; attempt += 1) {
    const updates = await getUserNonFundingLedgerUpdates(userAddress);
    const match = updates.find(matcher);
    if (match) {
      return match;
    }

    await sleep(LEDGER_POLL_INTERVAL_MS);
  }

  return null;
}

export interface OrderResult {
  success: boolean;
  statuses?: OrderStatus[];
  error?: string;
}

export async function placeOrder(
  agent: PrivateKeyAccount,
  params: OrderParams,
): Promise<OrderResult> {
  const meta = await getAssetMetaForSymbol(params.symbol);
  const isMarketOrder = params.tif === "FrontendMarket" || params.tif === "Ioc";
  const priceForExecution = isMarketOrder
    ? getMarketExecutionPrice(params.price, params.isBuy)
    : params.price;
  const formattedPrice = formatPrice(priceForExecution, meta.szDecimals);
  const formattedSize = formatSize(params.size, meta.szDecimals);
  const tif = isMarketOrder ? "FrontendMarket" : params.tif;

  if (Number(formattedSize) === 0) {
    return { success: false, error: `Size too small. Minimum: ${Math.pow(10, -meta.szDecimals)}` };
  }

  const action: Record<string, unknown> = {
    type: "order",
    orders: [
      {
        a: meta.assetIndex,
        b: params.isBuy,
        p: formattedPrice,
        s: formattedSize,
        r: params.reduceOnly,
        t: { limit: { tif } },
      },
    ],
    grouping: "na",
  };

  const nonce = Date.now();
  console.info("[trade] placeOrder payload", {
    agentAddress: agent.address,
    symbol: params.symbol,
    assetIndex: meta.assetIndex,
    szDecimals: meta.szDecimals,
    maxLeverage: meta.maxLeverage,
    requestedParams: params,
    isMarketOrder,
    priceForExecution,
    formattedPrice,
    formattedSize,
    tif,
    action,
    nonce,
  });

  const signature = await signWithAgent(agent, action, nonce);
  console.info("[trade] placeOrder signature", {
    agentAddress: agent.address,
    nonce,
    signature,
  });

  const raw = await postExchangeAction(action, nonce, signature) as ExchangeResponse;
  console.info("[trade] placeOrder exchange response", {
    agentAddress: agent.address,
    symbol: params.symbol,
    assetIndex: meta.assetIndex,
    nonce,
    raw,
  });

  if (raw.status === "err") {
    return { success: false, error: raw.response };
  }

  const statuses = raw.response.data.statuses;
  const firstStatus = statuses[0];

  if (firstStatus && typeof firstStatus === "object" && "error" in firstStatus) {
    return { success: false, error: firstStatus.error, statuses };
  }

  return { success: true, statuses };
}

export interface CancelResult {
  success: boolean;
  error?: string;
}

export async function getL2BookSnapshot(
  symbol: string,
  signal?: AbortSignal,
): Promise<{ bids: BookLevel[]; asks: BookLevel[] }> {
  const raw = await postInfo<{
    levels?: [
      { px: string; sz: string }[],
      { px: string; sz: string }[],
    ];
  }>({
    type: "l2Book",
    coin: toCoin(symbol),
  }, signal);

  const levels = raw.levels;
  if (!levels || levels.length < 2) {
    return { bids: [], asks: [] };
  }

  const parseLevels = (items: { px: string; sz: string }[]): BookLevel[] => {
    return items
      .map((item) => ({
        price: parseFloat(item.px),
        size: parseFloat(item.sz),
      }))
      .filter((item) => Number.isFinite(item.price) && Number.isFinite(item.size) && item.size > 0);
  };

  return {
    bids: parseLevels(levels[0]),
    asks: parseLevels(levels[1]),
  };
}

export async function cancelOrder(
  agent: PrivateKeyAccount,
  symbol: string,
  orderId: number,
): Promise<CancelResult> {
  const meta = await getAssetMetaForSymbol(symbol);

  const action: Record<string, unknown> = {
    type: "cancel",
    cancels: [{ a: meta.assetIndex, o: orderId }],
  };

  const nonce = Date.now();
  const signature = await signWithAgent(agent, action, nonce);
  const raw = await postExchangeAction(action, nonce, signature) as ExchangeResponse;

  if (raw.status === "err") {
    return { success: false, error: raw.response };
  }

  return { success: true };
}

export async function updateLeverage(
  agent: PrivateKeyAccount,
  symbol: string,
  leverage: number,
  isCross: boolean,
): Promise<{ success: boolean; error?: string }> {
  const meta = await getAssetMetaForSymbol(symbol);

  const action: Record<string, unknown> = {
    type: "updateLeverage",
    asset: meta.assetIndex,
    isCross,
    leverage,
  };

  const nonce = Date.now();
  const signature = await signWithAgent(agent, action, nonce);
  const raw = await postExchangeAction(action, nonce, signature) as ExchangeResponse;

  if (raw.status === "err") {
    return { success: false, error: raw.response };
  }

  return { success: true };
}

export async function getMainUserState(
  userAddress: string,
  signal?: AbortSignal,
): Promise<UserState> {
  return postInfo<UserState>({
    type: "clearinghouseState",
    user: userAddress,
  }, signal);
}

export async function getUserState(
  userAddress: string,
  signal?: AbortSignal,
): Promise<UserState> {
  return postInfo<UserState>({
    type: "clearinghouseState",
    user: userAddress,
    dex: HL_CONFIG.DEX_NAME,
  }, signal);
}

export async function getUserOrders(
  userAddress: string,
  signal?: AbortSignal,
): Promise<UserOrder[]> {
  return postInfo<UserOrder[]>({
    type: "openOrders",
    user: userAddress,
    dex: HL_CONFIG.DEX_NAME,
  }, signal);
}

export async function getUserNonFundingLedgerUpdates(
  userAddress: string,
  signal?: AbortSignal,
): Promise<LedgerUpdate[]> {
  return postInfo<LedgerUpdate[]>({
    type: "userNonFundingLedgerUpdates",
    user: userAddress,
  }, signal);
}

export async function moveUsdcToDex(
  userAddress: `0x${string}`,
  amount: string,
  destinationDex: string,
  signatureChainId: number,
): Promise<void> {
  const nonce = Date.now();
  const action = {
    type: "sendAsset" as const,
    signatureChainId: `0x${signatureChainId.toString(16)}` as const,
    hyperliquidChain: "Mainnet" as const,
    destination: userAddress.toLowerCase() as `0x${string}`,
    sourceDex: "",
    destinationDex,
    token: "USDC",
    amount,
    fromSubAccount: "" as const,
    nonce,
  };

  const signature = await signSendAsset({
    signatureChainId,
    destination: action.destination,
    sourceDex: action.sourceDex,
    destinationDex: action.destinationDex,
    token: action.token,
    amount: action.amount,
    fromSubAccount: action.fromSubAccount,
    nonce,
  });

  const response = await fetch(EXCHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, nonce, signature }),
  });

  if (!response.ok) {
    throw new Error(`sendAsset failed: ${response.status}`);
  }

  const raw = await response.json() as { status: string; response?: string };
  if (raw.status === "err") {
    throw new Error(raw.response ?? "sendAsset failed");
  }
}

export async function moveUsdcAmountToDex(
  userAddress: `0x${string}`,
  amount: string,
  destinationDex: string,
  signatureChainId: number,
): Promise<{ amount: string; transferTxHash: string | null }> {
  const moveStartedAt = Date.now();

  await moveUsdcToDex(userAddress, amount, destinationDex, signatureChainId);

  const transferUpdate = await waitForLedgerSend(userAddress, (update) => {
    if (update.time < moveStartedAt) {
      return false;
    }

    if (!isSendLedgerDelta(update.delta)) {
      return false;
    }

    return (
      update.delta.destination.toLowerCase() === userAddress.toLowerCase() &&
      update.delta.sourceDex === "" &&
      update.delta.destinationDex === destinationDex &&
      update.delta.token === "USDC" &&
      update.delta.amount === amount
    );
  });

  return {
    amount,
    transferTxHash: transferUpdate?.hash ?? null,
  };
}

export async function moveBridgeDepositToDex(
  userAddress: `0x${string}`,
  bridgeTxHash: string,
  destinationDex: string,
  signatureChainId: number,
): Promise<{ amount: string; transferTxHash: string | null }> {
  const normalizedBridgeTxHash = bridgeTxHash.toLowerCase();
  const bridgeUpdate = await waitForLedgerSend(userAddress, (update) => {
    if (update.hash.toLowerCase() !== normalizedBridgeTxHash) {
      return false;
    }

    if (!isSendLedgerDelta(update.delta)) {
      return false;
    }

    return (
      update.delta.destination.toLowerCase() === userAddress.toLowerCase() &&
      update.delta.sourceDex === "" &&
      update.delta.destinationDex === "" &&
      update.delta.token === "USDC"
    );
  });

  if (!bridgeUpdate || !isSendLedgerDelta(bridgeUpdate.delta)) {
    throw new Error("Bridge reached Hyperliquid, but the deposit ledger update was not found.");
  }

  return moveUsdcAmountToDex(
    userAddress,
    bridgeUpdate.delta.amount,
    destinationDex,
    signatureChainId,
  );
}
