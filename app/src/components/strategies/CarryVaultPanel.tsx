"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";
import { useCarryVault } from "@/lib/hooks/useCarryVault";
import { useToast } from "@/components/ui/Toast";
import MaterialIcon from "@/components/ui/MaterialIcon";

type Tab = "deposit" | "withdraw";

function formatUsd(value: string | null): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

const STATUS_LABELS: Record<string, string> = {
  approve: "Approving SPYx...",
  deposit: "Depositing into vault...",
  withdraw: "Withdrawing from vault...",
};

export default function CarryVaultPanel() {
  const { open } = useAppKit();
  const { toast } = useToast();
  const vault = useCarryVault();
  const [tab, setTab] = useState<Tab>("deposit");
  const [amount, setAmount] = useState("");
  const [lastTx, setLastTx] = useState<string | null>(null);

  useEffect(() => {
    if (vault.pendingTx) setLastTx(vault.pendingTx);
  }, [vault.pendingTx]);

  useEffect(() => {
    vault.onTxConfirmed((action) => {
      if (action === "approve") {
        toast("SPYx approved — depositing now...", "info");
      } else if (action === "deposit") {
        toast("Deposit confirmed!", "success");
        setAmount("");
      } else if (action === "withdraw") {
        toast("Withdrawal confirmed!", "success");
        setAmount("");
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast("Enter a valid amount", "warning");
      return;
    }

    if (tab === "deposit") {
      const result = await vault.deposit(amount);
      if (!result.success) return;
    } else {
      const result = await vault.withdraw(amount);
      if (!result.success) return;
    }
  };

  const handleMax = () => {
    if (tab === "deposit" && vault.fmt.userSpyxBalance) {
      setAmount(vault.fmt.userSpyxBalance);
    } else if (tab === "withdraw" && vault.fmt.userShares) {
      setAmount(vault.fmt.userShares);
    }
  };

  const buttonLabel = vault.isTxConfirming && vault.txAction
    ? STATUS_LABELS[vault.txAction] ?? "Confirming..."
    : vault.isProcessing
      ? "Waiting for wallet..."
      : tab === "deposit"
        ? "Deposit SPYx"
        : "Withdraw";

  return (
    <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Target LTV
          </div>
          <div className="font-headline font-bold text-2xl text-primary">
            {vault.fmt.targetLtv ? `${vault.fmt.targetLtv}%` : "70%"}
          </div>
        </div>
        <div>
          <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Current LTV
          </div>
          <div className="font-headline font-bold text-2xl text-secondary">
            {vault.fmt.currentLtv ? `${vault.fmt.currentLtv}%` : "—"}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/10 space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-on-surface-variant">TVL</span>
          <span className="font-label font-bold text-sm">
            {vault.fmt.tvl ? `${parseFloat(vault.fmt.tvl).toFixed(6)} SPYx` : "—"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-on-surface-variant">Health Factor</span>
          <span className={`font-label font-bold text-sm ${
            vault.fmt.healthFactor && parseFloat(vault.fmt.healthFactor) < 1.3
              ? "text-error"
              : "text-primary"
          }`}>
            {vault.fmt.healthFactor ?? "—"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-on-surface-variant">Flowdesk Deposited</span>
          <span className="font-label font-bold text-sm">
            {formatUsd(vault.fmt.vaultDeposited)}
          </span>
        </div>
        {vault.fmt.userShares && parseFloat(vault.fmt.userShares) > 0 && (
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-on-surface-variant">Your Shares</span>
            <span className="font-label font-bold text-sm text-secondary">
              {parseFloat(vault.fmt.userShares).toFixed(4)} yxCARRY
            </span>
          </div>
        )}
      </div>

      {/* Deposit / Withdraw */}
      {vault.isConnected ? (
        <>
          <div className="flex gap-1 mb-4 bg-surface-container-highest rounded-lg p-1">
            <button
              onClick={() => { setTab("deposit"); setAmount(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-headline font-bold transition-colors ${
                tab === "deposit"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => { setTab("withdraw"); setAmount(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-headline font-bold transition-colors ${
                tab === "withdraw"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Amount input */}
          <div className="relative mb-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={tab === "deposit" ? "SPYx amount" : "yxCARRY shares"}
              disabled={vault.isProcessing}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-label text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 disabled:opacity-50"
            />
            <button
              onClick={handleMax}
              disabled={vault.isProcessing}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-label font-bold text-primary uppercase tracking-widest hover:opacity-80 disabled:opacity-30"
            >
              Max
            </button>
          </div>

          {/* Balance display */}
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-4 px-1">
            {tab === "deposit" ? (
              <>
                <Image src="/coins/SP500.svg" alt="SPYx" width={14} height={14} className="rounded-full" unoptimized />
                Balance: {vault.fmt.userSpyxBalance ? `${parseFloat(vault.fmt.userSpyxBalance).toFixed(4)} SPYx` : "—"}
              </>
            ) : (
              <>
                <MaterialIcon icon="currency_exchange" size="sm" className="text-primary" />
                Shares: {vault.fmt.userShares ? `${parseFloat(vault.fmt.userShares).toFixed(4)} yxCARRY` : "—"}
              </>
            )}
          </div>

          {/* Error */}
          {vault.txError && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-xs text-error flex items-center gap-2">
              <MaterialIcon icon="error" size="sm" />
              <span className="flex-1">{vault.txError}</span>
              <button onClick={vault.clearError} className="hover:opacity-70">
                <MaterialIcon icon="close" size="sm" />
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={vault.isProcessing || !amount}
            className="primary-gradient w-full py-4 rounded-full text-on-primary font-headline font-extrabold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonLabel}
          </button>

          {/* Tx link */}
          {lastTx && (
            <a
              href={`https://etherscan.io/tx/${lastTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-primary mt-3 hover:underline"
            >
              <MaterialIcon icon="open_in_new" size="sm" />
              View on Etherscan
            </a>
          )}
        </>
      ) : (
        <button
          onClick={() => open({ view: "Connect" })}
          className="primary-gradient w-full py-4 rounded-full text-on-primary font-headline font-extrabold text-lg shadow-lg"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
