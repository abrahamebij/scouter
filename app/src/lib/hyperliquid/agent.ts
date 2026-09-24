import type { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { signApproveAgent, postExchangeAction } from "./signing";

const STORAGE_PREFIX = "xprime_agent_";
const AGENT_NAME = "xPrime";
const DEFAULT_APPROVAL_VALIDITY_MS = 90 * 24 * 60 * 60 * 1000;

interface StoredAgent {
  privateKey: Hex;
  address: string;
  createdAt: number;
  approvedAt?: number;
  validUntil?: number;
}

function storageKey(userAddress: string): string {
  return `${STORAGE_PREFIX}${userAddress.toLowerCase()}`;
}

function loadAgentRecord(userAddress: string): StoredAgent | null {
  const raw = localStorage.getItem(storageKey(userAddress));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAgent;
  } catch {
    return null;
  }
}

function saveAgent(userAddress: string, agent: StoredAgent): void {
  localStorage.setItem(storageKey(userAddress), JSON.stringify(agent));
}

function hasLocalApproval(agent: StoredAgent): boolean {
  if (!agent.approvedAt) {
    return false;
  }

  return !agent.validUntil || agent.validUntil > Date.now();
}

export async function getOrCreateAgent(userAddress: string): Promise<PrivateKeyAccount> {
  const existing = loadAgentRecord(userAddress);
  if (existing) {
    return privateKeyToAccount(existing.privateKey);
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  saveAgent(userAddress, {
    privateKey,
    address: account.address,
    createdAt: Date.now(),
  });

  return account;
}

export function isAgentApproved(userAddress: string): boolean {
  const stored = loadAgentRecord(userAddress);
  if (!stored) {
    return false;
  }

  return hasLocalApproval(stored);
}

export function getStoredAgent(userAddress: string): PrivateKeyAccount | null {
  const stored = loadAgentRecord(userAddress);
  if (!stored) {
    return null;
  }

  return privateKeyToAccount(stored.privateKey);
}

export async function approveAgentOnHL(userAddress: string): Promise<boolean> {
  const stored = loadAgentRecord(userAddress);
  if (!stored) {
    throw new Error("No agent found. Create one first.");
  }

  const nonce = Date.now();
  const action = {
    type: "approveAgent" as const,
    signatureChainId: "0xa4b1" as const,
    hyperliquidChain: "Mainnet" as const,
    agentAddress: stored.address.toLowerCase() as `0x${string}`,
    agentName: AGENT_NAME,
    nonce,
  };

  const signature = await signApproveAgent(action);
  const result = await postExchangeAction(action, nonce, signature);
  const response = result as { status: string; response?: string };

  if (response.status === "err") {
    const message = response.response ?? "";
    if (message.includes("Extra agent already used")) {
      saveAgent(userAddress, {
        ...stored,
        approvedAt: Date.now(),
        validUntil: Date.now() + DEFAULT_APPROVAL_VALIDITY_MS,
      });
      return true;
    }

    console.error("Agent approval failed:", response.response);
    return false;
  }

  saveAgent(userAddress, {
    ...stored,
    approvedAt: Date.now(),
    validUntil: Date.now() + DEFAULT_APPROVAL_VALIDITY_MS,
  });
  return true;
}

export async function ensureApprovedAgent(userAddress: string): Promise<PrivateKeyAccount> {
  const agent = await getOrCreateAgent(userAddress);
  if (isAgentApproved(userAddress)) {
    return agent;
  }

  const didApprove = await approveAgentOnHL(userAddress);
  if (!didApprove) {
    throw new Error("Agent approval failed.");
  }

  return agent;
}

export function clearAgent(userAddress: string): void {
  localStorage.removeItem(storageKey(userAddress));
}
