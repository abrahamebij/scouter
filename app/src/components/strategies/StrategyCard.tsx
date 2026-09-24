"use client";

import Image from "next/image";
import Link from "next/link";
import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import {
  VAULT_ADDRESS,
  INK_SEPOLIA_CHAIN_ID,
  vaultAbi,
} from "@/lib/contracts/vault";
import {
  CARRY_VAULT_ADDRESS,
  ETH_MAINNET_CHAIN_ID,
  carryVaultAbi,
} from "@/lib/contracts/carryVault";

export interface Strategy {
  slug: string;
  name: string;
  subtitle: string;
  metricLabel: string;
  metricValue: string;
  riskLevel: string;
  riskColor: string;
  riskBg: string;
  tvl: string;
  assetIcons: string[];
  protocolIcons: string[];
  underlyings: string[];
  liveDataKey?: "leveraged-etf" | "carry-trade";
  comingSoon?: boolean;
}

const BPS = 10_000;
const USDC_DECIMALS = 6;
const SPYX_DECIMALS = 18;

function useLiveData(liveDataKey?: "leveraged-etf" | "carry-trade") {
  const { data: leveragedReads } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "totalAssets",
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "getCurrentLeverage",
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      enabled: liveDataKey === "leveraged-etf",
      refetchInterval: 30_000,
    },
  });

  const { data: carryReads } = useReadContracts({
    contracts: [
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "totalAssets",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "getCurrentLtv",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
    ],
    query: {
      enabled: liveDataKey === "carry-trade",
      refetchInterval: 30_000,
    },
  });

  if (liveDataKey === "leveraged-etf" && leveragedReads) {
    const totalAssets = leveragedReads[0]?.result as bigint | undefined;
    const leverage = leveragedReads[1]?.result as bigint | undefined;
    return {
      tvl: totalAssets != null
        ? `$${Number(formatUnits(totalAssets, USDC_DECIMALS)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : null,
      metricValue: null,
    };
  }

  if (liveDataKey === "carry-trade" && carryReads) {
    const totalAssets = carryReads[0]?.result as bigint | undefined;
    return {
      tvl: totalAssets != null
        ? `${Number(formatUnits(totalAssets, SPYX_DECIMALS)).toFixed(4)} SPYx`
        : null,
      metricValue: null,
    };
  }

  return { tvl: null, metricValue: null };
}

interface StrategyCardProps {
  strategy: Strategy;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
  const live = useLiveData(strategy.liveDataKey);

  const displayTvl = live.tvl ?? strategy.tvl;
  const displayMetric = live.metricValue ?? strategy.metricValue;

  return (
    <div className={`group bg-surface-container hover:bg-surface-container-high transition-all p-1 rounded-2xl border border-outline-variant/5${strategy.comingSoon ? " opacity-50" : ""}`}>
      <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
        {/* Icons + Name */}
        <div className="flex items-center gap-3 md:w-[280px] md:shrink-0">
          <div className="flex -space-x-2 shrink-0">
            {strategy.assetIcons.map((icon, i) => (
              <Image
                key={i}
                src={icon}
                alt=""
                width={32}
                height={32}
                className="rounded-full border-2 border-surface-container-lowest"
                unoptimized
              />
            ))}
          </div>
          <div>
            <h3 className="font-headline font-bold text-base leading-tight">
              {strategy.name}
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5 whitespace-nowrap">
              {strategy.subtitle}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-6 w-full">
          <div className="md:w-28">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
              {strategy.metricLabel}
            </p>
            <p className="text-xl font-headline font-bold text-primary">
              {displayMetric}
            </p>
          </div>
          <div className="md:w-24">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
              Risk Level
            </p>
            <span
              className={`inline-block px-3 py-1 rounded ${strategy.riskBg} ${strategy.riskColor} text-[10px] font-bold uppercase tracking-wider`}
            >
              {strategy.riskLevel}
            </span>
          </div>
          <div className="md:w-20">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
              TVL
            </p>
            <p className="text-sm font-label font-bold">{displayTvl}</p>
          </div>
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
              Protocols
            </p>
            <div className="flex -space-x-2">
              {strategy.protocolIcons.map((icon, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-surface-container-lowest border border-surface-container-lowest overflow-hidden">
                  <Image
                    src={icon}
                    alt=""
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
          {strategy.comingSoon ? (
            <span className="flex-1 md:w-40 py-3 bg-surface-container-high text-on-surface-variant/50 font-headline font-bold text-sm rounded-xl text-center cursor-default select-none">
              Coming Soon
            </span>
          ) : (
            <Link
              href={`/strategies/${strategy.slug}`}
              className="flex-1 md:w-40 py-3 primary-gradient text-on-primary font-headline font-bold text-sm rounded-xl text-center hover:shadow-[0_0_20px_rgba(78,242,180,0.3)] transition-all"
            >
              Deposit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
