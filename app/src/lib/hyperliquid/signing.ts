import { encode as msgpackEncode } from "@msgpack/msgpack";
import { keccak256, type Hex } from "viem";
import { signTypedData as viemSignTypedData } from "wagmi/actions";
import { wagmiAdapter } from "@/lib/config/appkit";
import type { HlSignature } from "./types";

const EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const HL_CHAIN_ID = 1337;

const APPROVE_AGENT_TYPES = {
  "HyperliquidTransaction:ApproveAgent": [
    { name: "hyperliquidChain", type: "string" },
    { name: "agentAddress", type: "address" },
    { name: "agentName", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
} as const;

const SEND_ASSET_TYPES = {
  "HyperliquidTransaction:SendAsset": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "sourceDex", type: "string" },
    { name: "destinationDex", type: "string" },
    { name: "token", type: "string" },
    { name: "amount", type: "string" },
    { name: "fromSubAccount", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
} as const;

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

function hashL1Action(action: Record<string, unknown>, nonce: number): Hex {
  const actionBytes = msgpackEncode(largeIntsToBigInt(action));
  const nonceBytes = toUint64BE(nonce);
  const vaultMarker = new Uint8Array([0]);

  const combined = new Uint8Array(actionBytes.length + nonceBytes.length + vaultMarker.length);
  combined.set(actionBytes, 0);
  combined.set(nonceBytes, actionBytes.length);
  combined.set(vaultMarker, actionBytes.length + nonceBytes.length);

  return keccak256(combined);
}

function splitSignature(sig: Hex): HlSignature {
  const r = `0x${sig.slice(2, 66)}` as `0x${string}`;
  const s = `0x${sig.slice(66, 130)}` as `0x${string}`;
  let v = parseInt(sig.slice(130, 132), 16);
  if (v === 0 || v === 1) v += 27;
  return { r, s, v };
}

function normalizeHexStrings(value: unknown): unknown {
  if (typeof value === "string" && /^0x[0-9a-fA-F]+$/.test(value)) {
    return value.toLowerCase();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeHexStrings);
  }

  if (typeof value === "object" && value !== null) {
    const normalized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      normalized[key] = normalizeHexStrings(entry);
    }
    return normalized;
  }

  return value;
}

function buildUserSignedMessage(
  action: Record<string, unknown>,
  types: Record<string, readonly { name: string; type: string }[]>,
): Record<string, unknown> {
  const primaryType = Object.keys(types)[0];
  const knownKeys = new Set(types[primaryType]?.map((field) => field.name) ?? []);
  const normalizedAction = normalizeHexStrings(action) as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(normalizedAction).filter(([key]) => knownKeys.has(key)),
  );
}

export async function signL1Action(
  action: Record<string, unknown>,
  nonce: number,
): Promise<HlSignature> {
  const connectionId = hashL1Action(action, nonce);

  const signature = await viemSignTypedData(wagmiAdapter.wagmiConfig, {
    domain: {
      name: "Exchange",
      version: "1",
      chainId: HL_CHAIN_ID,
      verifyingContract: ZERO_ADDRESS,
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

  return splitSignature(signature);
}

export async function signApproveAgent(action: {
  signatureChainId: `0x${string}`;
  hyperliquidChain: "Mainnet" | "Testnet";
  agentAddress: `0x${string}`;
  agentName: string;
  nonce: number;
}): Promise<HlSignature> {
  const message = buildUserSignedMessage(action, APPROVE_AGENT_TYPES);

  const signature = await viemSignTypedData(wagmiAdapter.wagmiConfig, {
    domain: {
      name: "HyperliquidSignTransaction",
      version: "1",
      chainId: parseInt(action.signatureChainId, 16),
      verifyingContract: ZERO_ADDRESS,
    },
    types: APPROVE_AGENT_TYPES,
    primaryType: "HyperliquidTransaction:ApproveAgent",
    message: {
      hyperliquidChain: message.hyperliquidChain as "Mainnet" | "Testnet",
      agentAddress: message.agentAddress as `0x${string}`,
      agentName: (message.agentName as string | undefined) ?? "",
      nonce: BigInt(message.nonce as number),
    },
  });

  return splitSignature(signature);
}

export async function signSendAsset(params: {
  signatureChainId: number;
  destination: `0x${string}`;
  sourceDex: string;
  destinationDex: string;
  token: string;
  amount: string;
  fromSubAccount?: "" | `0x${string}`;
  nonce: number;
}): Promise<HlSignature> {
  const action = {
    signatureChainId: `0x${params.signatureChainId.toString(16)}` as `0x${string}`,
    hyperliquidChain: "Mainnet" as const,
    destination: params.destination,
    sourceDex: params.sourceDex,
    destinationDex: params.destinationDex,
    token: params.token,
    amount: params.amount,
    fromSubAccount: params.fromSubAccount ?? "",
    nonce: params.nonce,
  };
  const message = buildUserSignedMessage(action, SEND_ASSET_TYPES);

  const signature = await viemSignTypedData(wagmiAdapter.wagmiConfig, {
    domain: {
      name: "HyperliquidSignTransaction",
      version: "1",
      chainId: params.signatureChainId,
      verifyingContract: ZERO_ADDRESS,
    },
    types: SEND_ASSET_TYPES,
    primaryType: "HyperliquidTransaction:SendAsset",
    message: {
      hyperliquidChain: message.hyperliquidChain as "Mainnet",
      destination: message.destination as string,
      sourceDex: message.sourceDex as string,
      destinationDex: message.destinationDex as string,
      token: message.token as string,
      amount: message.amount as string,
      fromSubAccount: message.fromSubAccount as string,
      nonce: BigInt(message.nonce as number),
    },
  });

  return splitSignature(signature);
}

export async function postExchangeAction(
  action: Record<string, unknown>,
  nonce: number,
  signature: HlSignature,
): Promise<unknown> {
  const response = await fetch(EXCHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, nonce, signature }),
  });

  if (!response.ok) {
    throw new Error(`Exchange API returned ${response.status}`);
  }

  return response.json();
}
