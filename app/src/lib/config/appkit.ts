import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum, base, ink, mainnet, optimism, polygon } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

/** Ink Sepolia testnet — used for vault contract deployment */
export const inkSepolia = {
  id: 763373,
  name: "Ink Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-gel-sepolia.inkonchain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer-sepolia.inkonchain.com",
    },
  },
  testnet: true,
} as const satisfies AppKitNetwork;

/**
 * Supported networks:
 * - Arbitrum: required for Hyperliquid perp signing (EIP-712 chainId 42161)
 * - Ink: used for xStocks vault contracts on mainnet
 * - Ink Sepolia: vault contracts testnet deployment
 * - Ethereum, Base, Optimism, Polygon: mainnet and LI.FI bridge source chains
 */
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  arbitrum,
  ink,
  inkSepolia,
  mainnet,
  base,
  optimism,
  polygon,
];

/** Arbitrum chain ID — required for Hyperliquid agent approval signing. */
export const ARBITRUM_CHAIN_ID = 42161;

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

const origin =
  typeof window !== "undefined" ? window.location.origin : "https://xprime.app";

export const metadata = {
  name: "xPrime",
  description: "Structured yield for xStocks",
  url: origin,
  icons: [`${origin}/coins/XYZ100.svg`],
};
