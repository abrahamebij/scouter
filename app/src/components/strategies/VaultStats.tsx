"use client";

import { useVault } from "@/lib/hooks/useVault";
import { VAULT_ADDRESS, USDC_ADDRESS } from "@/lib/contracts/vault";
import MaterialIcon from "@/components/ui/MaterialIcon";

const EXPLORER = "https://explorer-sepolia.inkonchain.com/address";

function formatUsd(value: string | null): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function VaultStats() {
  const vault = useVault();

  const stats = [
    {
      label: "Collateral Value",
      value: formatUsd(vault.fmt.collateralUsd),
    },
    {
      label: "Debt Value",
      value: formatUsd(vault.fmt.debtUsd),
      color: "text-error",
    },
    {
      label: "Health Factor",
      value: vault.fmt.healthFactor ?? "—",
      color: "text-primary",
    },
    {
      label: "Current Leverage",
      value: vault.fmt.leverage ? `${vault.fmt.leverage}x` : "—",
    },
  ];

  const contracts = [
    { label: "Strategy Vault (yxSPY)", addr: VAULT_ADDRESS },
    { label: "Underlying Asset (USDC)", addr: USDC_ADDRESS },
  ];

  return (
    <>
      <h3 className="font-headline text-2xl font-bold mb-8">Vault Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest p-6 rounded-xl"
          >
            <div className="text-[10px] font-label text-on-surface-variant uppercase mb-2">
              {stat.label}
            </div>
            <div
              className={`text-2xl font-headline font-bold ${stat.color || ""}`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-headline text-xl font-bold mb-6">
        Contract Addresses
      </h3>
      <div className="space-y-3">
        {contracts.map((c) => (
          <div
            key={c.label}
            className="bg-surface-container-lowest p-4 rounded-lg flex justify-between items-center group"
          >
            <div className="flex flex-col">
              <span className="font-label text-[10px] uppercase text-on-surface-variant">
                {c.label}
              </span>
              <a
                href={`${EXPLORER}/${c.addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label text-xs hover:text-primary transition-colors"
              >
                {c.addr.slice(0, 6)}...{c.addr.slice(-4)}
              </a>
            </div>
            <button
              onClick={() => copyToClipboard(c.addr)}
              className="opacity-50 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <MaterialIcon icon="content_copy" size="sm" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
