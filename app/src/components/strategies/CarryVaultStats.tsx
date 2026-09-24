"use client";

import { useCarryVault } from "@/lib/hooks/useCarryVault";
import {
  CARRY_VAULT_ADDRESS,
  SPYX_ADDRESS,
  FLOWDESK_VAULT_ADDRESS,
  MORPHO_ADDRESS,
} from "@/lib/contracts/carryVault";
import MaterialIcon from "@/components/ui/MaterialIcon";

const EXPLORER = "https://etherscan.io/address";

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

export default function CarryVaultStats() {
  const vault = useCarryVault();

  const stats = [
    {
      label: "Collateral (SPYx)",
      value: formatUsd(vault.fmt.collateralValue),
    },
    {
      label: "Debt (aUSD)",
      value: formatUsd(vault.fmt.debtValue),
      color: "text-error",
    },
    {
      label: "Health Factor",
      value: vault.fmt.healthFactor ?? "—",
      color: vault.fmt.healthFactor && parseFloat(vault.fmt.healthFactor) < 1.3
        ? "text-error"
        : "text-primary",
    },
    {
      label: "Flowdesk Deposited",
      value: formatUsd(vault.fmt.vaultDeposited),
      color: "text-primary",
    },
  ];

  const contracts = [
    { label: "Carry Vault (yxCARRY)", addr: CARRY_VAULT_ADDRESS },
    { label: "Underlying Asset (SPYx)", addr: SPYX_ADDRESS },
    { label: "Morpho Blue", addr: MORPHO_ADDRESS },
    { label: "Flowdesk Vault", addr: FLOWDESK_VAULT_ADDRESS },
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
