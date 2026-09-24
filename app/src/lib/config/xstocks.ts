/**
 * xStocks spot configuration.
 *
 * Maps the underlying equity symbol (matching Hyperliquid perp markets)
 * to xStock deployments on supported spot chains.
 */

export const INK_CHAIN_ID = 57073;
export const MAINNET_CHAIN_ID = 1;
export const HYPERLIQUID_CORE_CHAIN_ID = 1337;

export type SpotChainId = typeof INK_CHAIN_ID | typeof MAINNET_CHAIN_ID;

export const USDC_INK = {
  address: "0x2d270e6886d130d724215a266106e6832161eaed" as `0x${string}`,
  decimals: 6,
  symbol: "USDC",
} as const;

export const USDC_MAINNET = {
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
  decimals: 6,
  symbol: "USDC",
} as const;

export const USDC_HYPERLIQUID_SPOT = {
  address: "0x6d1e7cde53ba9467b783cb7c530ce05400000000" as `0x${string}`,
  decimals: 6,
  symbol: "USDC",
} as const;

export const USDC_HYPERLIQUID_PERPS = {
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
  decimals: 6,
  symbol: "USDC",
} as const;

export interface SpotChainConfig {
  chainId: SpotChainId;
  name: string;
  shortName: string;
  icon: string;
  usdc: `0x${string}`;
  usdcDecimals: number;
  actionLabel: string;
  orderExplorerBaseUrl: string;
}

export const SPOT_CHAIN_CONFIGS: Record<SpotChainId, SpotChainConfig> = {
  [INK_CHAIN_ID]: {
    chainId: INK_CHAIN_ID,
    name: "Ink",
    shortName: "Ink",
    icon: "/chains/ink.svg",
    usdc: USDC_INK.address,
    usdcDecimals: USDC_INK.decimals,
    actionLabel: "Switch to Ink",
    orderExplorerBaseUrl: "https://explorer.cow.fi/ink/orders",
  },
  [MAINNET_CHAIN_ID]: {
    chainId: MAINNET_CHAIN_ID,
    name: "Ethereum",
    shortName: "Ethereum",
    icon: "/chains/ethereum.svg",
    usdc: USDC_MAINNET.address,
    usdcDecimals: USDC_MAINNET.decimals,
    actionLabel: "Switch to Ethereum",
    orderExplorerBaseUrl: "https://explorer.cow.fi/mainnet/orders",
  },
};

export const SPOT_CHAINS = [
  SPOT_CHAIN_CONFIGS[INK_CHAIN_ID],
  SPOT_CHAIN_CONFIGS[MAINNET_CHAIN_ID],
] as const;

export const DEFAULT_SPOT_CHAIN_ID = INK_CHAIN_ID;

export const BRIDGE_DESTINATIONS = {
  spot: {
    chainId: INK_CHAIN_ID,
    token: USDC_INK,
    title: "Bridge to Ink",
    chainName: "Ink",
    chainDescription: "Destination for xStocks spot swaps",
    completionMessage: "Bridge complete! USDC is now on Ink.",
    actionLabel: "Bridge to Ink",
  },
  perp: {
    chainId: HYPERLIQUID_CORE_CHAIN_ID,
    token: USDC_HYPERLIQUID_PERPS,
    title: "Bridge to Hyperliquid Core",
    chainName: "Hyperliquid Core",
    chainDescription: "Destination for Hyperliquid perp funding",
    completionMessage: "Bridge complete! Funds were sent to Hyperliquid Core.",
    actionLabel: "Bridge to Hyperliquid Core",
  },
} as const;

export const COW_SETTLEMENT_INK =
  "0x9008D19f58AAbD9eD0D60971565AA8510560ab41" as `0x${string}`;

export interface XStockDeployment {
  chainId: SpotChainId;
  address: `0x${string}`;
  decimals: 18;
  stablecoin: {
    address: `0x${string}`;
    decimals: number;
    symbol: "USDC";
  };
}

interface XStockTokenConfig {
  xSymbol: string;
  name: string;
  deployments: Partial<Record<SpotChainId, XStockDeployment>>;
}

export interface XStockToken extends XStockDeployment {
  xSymbol: string;
  name: string;
}

function createDeployment(
  chainId: SpotChainId,
  address: `0x${string}`,
): XStockDeployment {
  const stablecoin = chainId === MAINNET_CHAIN_ID ? USDC_MAINNET : USDC_INK;

  return {
    chainId,
    address,
    decimals: 18,
    stablecoin: {
      address: stablecoin.address,
      decimals: stablecoin.decimals,
      symbol: stablecoin.symbol,
    },
  };
}

function inkDeployment(address: `0x${string}`): XStockDeployment {
  return createDeployment(INK_CHAIN_ID, address);
}

function ethereumDeployment(address: `0x${string}`): XStockDeployment {
  return createDeployment(MAINNET_CHAIN_ID, address);
}

export const XSTOCK_TOKENS: Record<string, XStockTokenConfig> = {
  TSLA: {
    xSymbol: "TSLAx",
    name: "Tesla xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x8ad3c73f833d3f9a523ab01476625f269aeb7cf0"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x8ad3c73f833d3f9a523ab01476625f269aeb7cf0"),
    },
  },
  NVDA: {
    xSymbol: "NVDAx",
    name: "NVIDIA xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xc845b2894dbddd03858fd2d643b4ef725fe0849d"),
    },
  },
  AAPL: {
    xSymbol: "AAPLx",
    name: "Apple xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a"),
    },
  },
  MSFT: {
    xSymbol: "MSFTx",
    name: "Microsoft xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x5621737f42dae558b81269fcb9e9e70c19aa6b35"),
    },
  },
  GOOGL: {
    xSymbol: "GOOGLx",
    name: "Alphabet xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xe92f673ca36c5e2efd2de7628f815f84807e803f"),
    },
  },
  AMZN: {
    xSymbol: "AMZNx",
    name: "Amazon xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x3557ba345b01efa20a1bddc61f573bfd87195081"),
    },
  },
  META: {
    xSymbol: "METAx",
    name: "Meta Platforms xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x96702be57cd9777f835117a809c7124fe4ec989a"),
    },
  },
  AMD: {
    xSymbol: "AMDx",
    name: "AMD xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x3522513e5f146a2006e2901b05f16b2821485e19"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x3522513e5f146a2006e2901b05f16b2821485e19"),
    },
  },
  INTC: {
    xSymbol: "INTCx",
    name: "Intel xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xf8a80d1cb9cfd70d03d655d9df42339846f3b3c8"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xf8a80d1cb9cfd70d03d655d9df42339846f3b3c8"),
    },
  },
  ORCL: {
    xSymbol: "ORCLx",
    name: "Oracle xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x548308e91ec9f285c7bff05295badbd56a6e4971"),
    },
  },
  NFLX: {
    xSymbol: "NFLXx",
    name: "Netflix xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xa6a65ac27e76cd53cb790473e4345c46e5ebf961"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xa6a65ac27e76cd53cb790473e4345c46e5ebf961"),
    },
  },
  COIN: {
    xSymbol: "COINx",
    name: "Coinbase xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x364f210f430ec2448fc68a49203040f6124096f0"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x364f210f430ec2448fc68a49203040f6124096f0"),
    },
  },
  HOOD: {
    xSymbol: "HOODx",
    name: "Robinhood xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xe1385fdd5ffb10081cd52c56584f25efa9084015"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xe1385fdd5ffb10081cd52c56584f25efa9084015"),
    },
  },
  MSTR: {
    xSymbol: "MSTRx",
    name: "MicroStrategy xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xae2f842ef90c0d5213259ab82639d5bbf649b08e"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xae2f842ef90c0d5213259ab82639d5bbf649b08e"),
    },
  },
  PLTR: {
    xSymbol: "PLTRx",
    name: "Palantir xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x6d482cec5f9dd1f05ccee9fd3ff79b246170f8e2"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x6d482cec5f9dd1f05ccee9fd3ff79b246170f8e2"),
    },
  },
  CRCL: {
    xSymbol: "CRCLx",
    name: "Circle xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xfebded1b0986a8ee107f5ab1a1c5a813491deceb"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xfebded1b0986a8ee107f5ab1a1c5a813491deceb"),
    },
  },
  LLY: {
    xSymbol: "LLYx",
    name: "Eli Lilly xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x19c41ea77b34bbdee61c3a87a75d1abda2ed0be4"),
    },
  },
  GME: {
    xSymbol: "GMEx",
    name: "GameStop xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xe5f6d3b2405abdfe6f660e63202b25d23763160d"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xe5f6d3b2405abdfe6f660e63202b25d23763160d"),
    },
  },
  TSM: {
    xSymbol: "TSMx",
    name: "TSMC xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x9e3bf4ecfc44eedd624f26656b6736a3f093b073"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x9e3bf4ecfc44eedd624f26656b6736a3f093b073"),
    },
  },
  MU: {
    xSymbol: "MUx",
    name: "Micron xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xf6a873bae4ba1b304e45df52a4b7d176e1c6a8c4"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xf6a873bae4ba1b304e45df52a4b7d176e1c6a8c4"),
    },
  },
  SNDK: {
    xSymbol: "SNDKx",
    name: "SanDisk xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xb63efbc28860c8097e341de1fcf59456161e9d98"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xb63efbc28860c8097e341de1fcf59456161e9d98"),
    },
  },
  LITE: {
    xSymbol: "LITEx",
    name: "Lumentum xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0xaaa9cf4e9488f5eef064b8cfac70f5fd857669dc"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0xaaa9cf4e9488f5eef064b8cfac70f5fd857669dc"),
    },
  },
  USAR: {
    xSymbol: "USARx",
    name: "USA Rare Earth xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x6ee270d24b593f85863e95b6a7dd916a5957719f"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x6ee270d24b593f85863e95b6a7dd916a5957719f"),
    },
  },
  XLE: {
    xSymbol: "XLEx",
    name: "Energy Select Sector SPDR xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x6f75ac3b1b6fbe8bb5f948e25af03620f26ae838"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x6f75ac3b1b6fbe8bb5f948e25af03620f26ae838"),
    },
  },
  SP500: {
    xSymbol: "SPYx",
    name: "SP500 xStock",
    deployments: {
      [INK_CHAIN_ID]: inkDeployment("0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48"),
      [MAINNET_CHAIN_ID]: ethereumDeployment("0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48"),
    },
  },
};

export const XSTOCK_SYMBOL_ALIASES: Record<string, string> = {
  SPY: "SP500",
};

export const SPOT_MARKETS = Object.keys(XSTOCK_TOKENS);

function resolveXStockSymbol(symbol: string): string {
  return XSTOCK_SYMBOL_ALIASES[symbol] ?? symbol;
}

export function hasSpotMarket(symbol: string): boolean {
  return resolveXStockSymbol(symbol) in XSTOCK_TOKENS;
}

export function getXStockToken(
  symbol: string,
  chainId: SpotChainId = DEFAULT_SPOT_CHAIN_ID,
): XStockToken | undefined {
  const resolved = XSTOCK_TOKENS[resolveXStockSymbol(symbol)];
  const deployment = resolved?.deployments[chainId];

  if (!resolved || !deployment) {
    return undefined;
  }

  return {
    xSymbol: resolved.xSymbol,
    name: resolved.name,
    chainId: deployment.chainId,
    address: deployment.address,
    decimals: deployment.decimals,
    stablecoin: deployment.stablecoin,
  };
}

export function supportsSpotChain(symbol: string, chainId: SpotChainId): boolean {
  return Boolean(getXStockToken(symbol, chainId));
}

export function getSpotChainConfig(chainId: number): SpotChainConfig | undefined {
  if (!isSupportedSpotChain(chainId)) {
    return undefined;
  }

  return SPOT_CHAIN_CONFIGS[chainId];
}

export function getSpotChainOptions(symbol: string): Array<SpotChainConfig & { available: boolean }> {
  return SPOT_CHAINS.map((chain) => ({
    ...chain,
    available: supportsSpotChain(symbol, chain.chainId),
  }));
}

export function getPreferredSpotChainId(symbol: string, currentChainId?: number): SpotChainId {
  if (currentChainId && isSupportedSpotChain(currentChainId) && supportsSpotChain(symbol, currentChainId)) {
    return currentChainId;
  }

  if (supportsSpotChain(symbol, MAINNET_CHAIN_ID)) {
    return MAINNET_CHAIN_ID;
  }

  return DEFAULT_SPOT_CHAIN_ID;
}

export function isSupportedSpotChain(chainId: number): chainId is SpotChainId {
  return chainId === INK_CHAIN_ID || chainId === MAINNET_CHAIN_ID;
}

export const BRIDGE_SOURCE_CHAINS = [
  {
    chainId: 42161,
    name: "Arbitrum",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
    icon: "/chains/arbitrum.svg",
  },
  {
    chainId: 1,
    name: "Ethereum",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
    icon: "/chains/ethereum.svg",
  },
  {
    chainId: 8453,
    name: "Base",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
    icon: "/chains/base.svg",
  },
  {
    chainId: 10,
    name: "Optimism",
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" as `0x${string}`,
    icon: "/chains/optimism.svg",
  },
  {
    chainId: 137,
    name: "Polygon",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" as `0x${string}`,
    icon: "/chains/polygon.svg",
  },
] as const;

export interface AppChainInfo {
  chainId: number;
  name: string;
  icon: string;
  nativeSymbol: string;
  usdc?: `0x${string}`;
}

export const APP_CHAIN_INFO: Record<number, AppChainInfo> = {
  42161: {
    chainId: 42161,
    name: "Arbitrum",
    icon: "/chains/arbitrum.svg",
    nativeSymbol: "ETH",
    usdc: BRIDGE_SOURCE_CHAINS[0].usdc,
  },
  57073: {
    chainId: 57073,
    name: "Ink",
    icon: "/chains/ink.svg",
    nativeSymbol: "ETH",
    usdc: USDC_INK.address,
  },
  763373: {
    chainId: 763373,
    name: "Ink Sepolia",
    icon: "/chains/ink.svg",
    nativeSymbol: "ETH",
  },
  1: {
    chainId: 1,
    name: "Ethereum",
    icon: "/chains/ethereum.svg",
    nativeSymbol: "ETH",
    usdc: BRIDGE_SOURCE_CHAINS[1].usdc,
  },
  8453: {
    chainId: 8453,
    name: "Base",
    icon: "/chains/base.svg",
    nativeSymbol: "ETH",
    usdc: BRIDGE_SOURCE_CHAINS[2].usdc,
  },
  10: {
    chainId: 10,
    name: "Optimism",
    icon: "/chains/optimism.svg",
    nativeSymbol: "ETH",
    usdc: BRIDGE_SOURCE_CHAINS[3].usdc,
  },
  137: {
    chainId: 137,
    name: "Polygon",
    icon: "/chains/polygon.svg",
    nativeSymbol: "POL",
    usdc: BRIDGE_SOURCE_CHAINS[4].usdc,
  },
};

export function getAppChainInfo(chainId: number): AppChainInfo | undefined {
  return APP_CHAIN_INFO[chainId];
}
