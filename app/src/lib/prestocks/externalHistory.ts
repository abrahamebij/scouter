import { PreStockDerived } from "./types";
import { CompanySnapshot } from "./snapshots";
import { normalizeSymbol } from "./transforms";

export interface PoolMeta {
  pool: string;
  tokenAddress: string;
}

export const PRESTOCKS_POOLS: Record<string, PoolMeta> = {
  anduril: {
    pool: "DZwJYn5ZgC3ZzJPjdzLnpufr3YHJ8PveNyXomzoh1Md4",
    tokenAddress: "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB",
  },
  anthropic: {
    pool: "EZyszDEx1LZDt7TsSFV8xdPi49sDKC3mdfv2MVMEQLtU",
    tokenAddress: "Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw",
  },
  figureai: {
    pool: "AG8Sui3oZ9eEsNwdQfxQkQfiniHHJNFCxXgdR1Wsa8Ji",
    tokenAddress: "PreZad18qfPtbxNpMtMuAuX2zVpvkEU8DnJx56faCWd",
  },
  kalshi: {
    pool: "6gVN1JBffdyFtkSgsHTkGiyzmbp7oJsLuQho56aPx7Fy",
    tokenAddress: "PreLWGkkeqG1s4HEfFZSy9moCrJ7btsHuUtfcCeoRua",
  },
  neuralink: {
    pool: "GhznDwSWioFirbyAJY5GWpwcfN4NNR2KPY9Q9XPHT8Ry",
    tokenAddress: "PrekqLJvJ3qVdXmBGDiexvwUTF4rLFDa6HWS4HJbw9S",
  },
  openai: {
    pool: "4HTy7aTjPm5PTSEws2yWRDPX6gjWM6sC2dV5mv9u8JsH",
    tokenAddress: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
  },
  polymarket: {
    pool: "gPchZYUR4prBpYr4BQDZdB4fwYxWSh8h2rY83CQxN61",
    tokenAddress: "Pre8AREmFPtoJFT8mQSXQLh56cwJmM7CFDRuoGBZiUP",
  },
  spacex: {
    pool: "9DuT2XuEWrRA1VSRVmNdiwPoSr357PEL2Zh6m3ZWBXEV",
    tokenAddress: "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh",
  },
};

// In-memory server-side cache with 2-minute TTL
interface CacheEntry {
  data: CompanySnapshot[];
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 1000;

interface DexScreenerPairResponse {
  pairs?: Array<{
    priceUsd?: string;
    priceChange?: {
      m5?: number;
      h1?: number;
      h6?: number;
      h24?: number;
    };
  }>;
  pair?: {
    priceUsd?: string;
    priceChange?: {
      m5?: number;
      h1?: number;
      h6?: number;
      h24?: number;
    };
  };
}

interface GeckoTerminalOHLCVResponse {
  data?: {
    attributes?: {
      ohlcv_list?: Array<[number, number, number, number, number, number]>;
    };
  };
}

interface BirdeyeOhlcvItem {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  unixTime: number;
}

interface BirdeyeResponse {
  success?: boolean;
  data?: {
    items?: BirdeyeOhlcvItem[];
  };
}

/**
 * Fetches real on-chain market history for a PreStocks token.
 * Supports Birdeye (if BIRDEYE_API_KEY is configured), GeckoTerminal, and DexScreener fallback.
 */
export async function fetchExternalMarketHistory(
  symbol: string,
  product?: PreStockDerived,
  timeframe = "1D"
): Promise<CompanySnapshot[]> {
  const norm = normalizeSymbol(symbol).toLowerCase();
  const cacheKey = `${norm}:${timeframe}`;
  const now = Date.now();

  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const poolMeta = PRESTOCKS_POOLS[norm];
  if (!poolMeta) {
    return [];
  }

  let snapshots: CompanySnapshot[] = [];

  // Priority 1: Birdeye (if BIRDEYE_API_KEY environment variable is configured)
  const birdeyeKey = process.env.BIRDEYE_API_KEY;
  if (birdeyeKey) {
    try {
      let intervalType = "15m";
      let timeFromSec = Math.floor((now - 24 * 60 * 60 * 1000) / 1000);

      if (timeframe === "1W") {
        intervalType = "1H";
        timeFromSec = Math.floor((now - 7 * 24 * 60 * 60 * 1000) / 1000);
      } else if (timeframe === "1M" || timeframe === "3M" || timeframe === "ALL") {
        intervalType = "1D";
        timeFromSec = Math.floor((now - 90 * 24 * 60 * 60 * 1000) / 1000);
      }

      const timeToSec = Math.floor(now / 1000);
      const url = `https://public-api.birdeye.so/defi/ohlcv?address=${poolMeta.tokenAddress}&type=${intervalType}&time_from=${timeFromSec}&time_to=${timeToSec}`;

      const bRes = await fetch(url, {
        headers: {
          "X-API-KEY": birdeyeKey,
          Accept: "application/json",
        },
        next: { revalidate: 120 },
      });

      if (bRes.ok) {
        const bJson: BirdeyeResponse = await bRes.json();
        const items = bJson.data?.items || [];
        if (items.length > 0) {
          const markPrice = product?.markPrice ?? 0;
          const baseRatio = product && product.tokenPrice > 0 ? product.impliedValuation / product.tokenPrice : 1;

          snapshots = items.map((item) => {
            const ts = item.unixTime * 1000;
            const close = item.c;
            const premium = markPrice > 0 ? ((close - markPrice) / markPrice) * 100 : 0;

            return {
              symbol: norm,
              timestamp: ts,
              tokenPrice: close,
              markPrice,
              impliedValuation: close * baseRatio,
              markValuation: product?.markValuation ?? 0,
              premiumPercent: Number(premium.toFixed(2)),
              supply: product?.supply,
            };
          });
        }
      }
    } catch (err) {
      console.error(`Birdeye OHLCV fetch error for ${norm}:`, err);
    }
  }

  // Priority 2: GeckoTerminal OHLCV candles (public on-chain feed)
  if (snapshots.length < 2) {
    try {
      let endpoint = "";
      if (timeframe === "1D") {
        endpoint = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolMeta.pool}/ohlcv/minute?aggregate=15&limit=96`;
      } else if (timeframe === "1W") {
        endpoint = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolMeta.pool}/ohlcv/hour?limit=168`;
      } else {
        endpoint = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolMeta.pool}/ohlcv/day?limit=90`;
      }

      const res = await fetch(endpoint, {
        headers: {
          Accept: "application/json;version=20230203",
          "User-Agent": "ScouterTerminal/1.0",
        },
        next: { revalidate: 120 },
      });

      if (res.ok) {
        const json: GeckoTerminalOHLCVResponse = await res.json();
        const rawList = json.data?.attributes?.ohlcv_list || [];

        if (rawList.length > 0) {
          const markPrice = product?.markPrice ?? 0;
          const baseRatio = product && product.tokenPrice > 0 ? product.impliedValuation / product.tokenPrice : 1;

          snapshots = rawList
            .slice()
            .reverse()
            .map((c) => {
              const ts = c[0] * 1000;
              const close = Number(c[4]);
              const premium = markPrice > 0 ? ((close - markPrice) / markPrice) * 100 : 0;

              return {
                symbol: norm,
                timestamp: ts,
                tokenPrice: close,
                markPrice,
                impliedValuation: close * baseRatio,
                markValuation: product?.markValuation ?? 0,
                premiumPercent: Number(premium.toFixed(2)),
                supply: product?.supply,
              };
            });
        }
      }
    } catch (err) {
      console.error(`GeckoTerminal OHLCV fetch failed for ${norm}:`, err);
    }
  }

  // Priority 3: DexScreener real-time secondary price & delta trajectory
  if (snapshots.length < 2) {
    try {
      const dsRes = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/solana/${poolMeta.pool}`,
        { next: { revalidate: 60 } }
      );

      if (dsRes.ok) {
        const dsJson: DexScreenerPairResponse = await dsRes.json();
        const pair = dsJson.pairs?.[0] || dsJson.pair;

        if (pair && pair.priceUsd) {
          const currentPrice = parseFloat(pair.priceUsd);
          const ch24 = (pair.priceChange?.h24 || 0) / 100;
          const ch6 = (pair.priceChange?.h6 || 0) / 100;
          const ch1 = (pair.priceChange?.h1 || 0) / 100;
          const ch5m = (pair.priceChange?.m5 || 0) / 100;

          const p24 = currentPrice / (1 + ch24);
          const p6 = currentPrice / (1 + ch6);
          const p1 = currentPrice / (1 + ch1);
          const p5m = currentPrice / (1 + ch5m);

          const markPrice = product?.markPrice ?? currentPrice;
          const baseRatio = product && product.tokenPrice > 0 ? product.impliedValuation / product.tokenPrice : 1;

          const checkpoints: Array<{ timeOffsetMs: number; price: number }> = [
            { timeOffsetMs: 24 * 60 * 60 * 1000, price: p24 },
            { timeOffsetMs: 18 * 60 * 60 * 1000, price: p24 * 0.65 + p6 * 0.35 },
            { timeOffsetMs: 12 * 60 * 60 * 1000, price: p24 * 0.3 + p6 * 0.7 },
            { timeOffsetMs: 6 * 60 * 60 * 1000, price: p6 },
            { timeOffsetMs: 3 * 60 * 60 * 1000, price: p6 * 0.5 + p1 * 0.5 },
            { timeOffsetMs: 60 * 60 * 1000, price: p1 },
            { timeOffsetMs: 30 * 60 * 1000, price: p1 * 0.5 + p5m * 0.5 },
            { timeOffsetMs: 5 * 60 * 1000, price: p5m },
            { timeOffsetMs: 0, price: currentPrice },
          ];

          snapshots = checkpoints.map((pt) => {
            const ts = now - pt.timeOffsetMs;
            const price = Number(pt.price.toFixed(4));
            const premium = markPrice > 0 ? ((price - markPrice) / markPrice) * 100 : 0;

            return {
              symbol: norm,
              timestamp: ts,
              tokenPrice: price,
              markPrice,
              impliedValuation: price * baseRatio,
              markValuation: product?.markValuation ?? 0,
              premiumPercent: Number(premium.toFixed(2)),
              supply: product?.supply,
            };
          });
        }
      }
    } catch (err) {
      console.error(`DexScreener fallback fetch failed for ${norm}:`, err);
    }
  }

  // Ensure current live product is attached as latest point
  if (product && snapshots.length > 0) {
    const last = snapshots[snapshots.length - 1];
    if (Math.abs(now - last.timestamp) > 30000) {
      snapshots.push({
        symbol: norm,
        timestamp: now,
        tokenPrice: product.tokenPrice,
        markPrice: product.markPrice,
        impliedValuation: product.impliedValuation,
        markValuation: product.markValuation,
        premiumPercent: Number(product.premiumPercent.toFixed(2)),
        supply: product.supply,
      });
    }
  }

  if (snapshots.length > 0) {
    memoryCache.set(cacheKey, { data: snapshots, timestamp: now });
  }

  return snapshots;
}
