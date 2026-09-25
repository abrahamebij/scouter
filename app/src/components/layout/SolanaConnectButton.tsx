"use client";

import { useState, useRef, useEffect } from "react";
import {
  useWallet,
  useWalletConnectors,
  useConnectWallet,
  useDisconnectWallet,
} from "@solana/connector/react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { truncateAddress } from "@/lib/prestocks/format";
import { useMounted } from "@/lib/prestocks/useMounted";

export default function SolanaConnectButton() {
  const isMounted = useMounted();
  const { isConnected, isConnecting, account } = useWallet();
  const connectors = useWalletConnectors();
  const { connect } = useConnectWallet();
  const { disconnect, isDisconnecting } = useDisconnectWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isMounted) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-headline font-semibold text-xs opacity-90 shadow-sm"
      >
        <MaterialIcon icon="account_balance_wallet" size="sm" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (isConnecting) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-headline font-medium text-on-surface-variant cursor-not-allowed opacity-80"
      >
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected && account) {
    const addressStr = typeof account === "string" ? account : String(account);
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-mono font-medium text-on-surface transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>{truncateAddress(addressStr, 4, 4)}</span>
          <MaterialIcon icon={dropdownOpen ? "expand_less" : "expand_more"} size="sm" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] w-48 rounded-xl bg-surface-container border border-outline-variant/30 p-2 shadow-lg shadow-black/40 z-50 space-y-1">
            <div className="px-2.5 py-1.5 text-[11px] font-mono text-on-surface-variant/70 border-b border-outline-variant/15">
              Solana Mainnet
            </div>
            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              disabled={isDisconnecting}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-headline text-error hover:bg-surface-container-highest flex items-center gap-2 transition-colors"
            >
              <MaterialIcon icon="logout" size="sm" />
              <span>{isDisconnecting ? "Disconnecting..." : "Disconnect"}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 shadow-sm transition-all"
      >
        <MaterialIcon icon="account_balance_wallet" size="sm" />
        <span>Connect Wallet</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-56 rounded-xl bg-surface-container border border-outline-variant/30 p-2 shadow-lg shadow-black/40 z-50 space-y-1">
          <div className="px-2.5 py-1.5 text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 border-b border-outline-variant/15">
            Select Solana Wallet
          </div>
          {connectors.length > 0 ? (
            connectors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  connect(c.id);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-headline text-on-surface hover:bg-surface-container-highest flex items-center justify-between transition-colors"
              >
                <span>{c.name}</span>
                {c.ready ? (
                  <span className="text-[10px] font-label text-accent uppercase">Detected</span>
                ) : (
                  <span className="text-[10px] text-on-surface-variant/50">Install</span>
                )}
              </button>
            ))
          ) : (
            <div className="px-2.5 py-3 text-xs text-on-surface-variant text-center font-light">
              No Solana wallets detected. Please install Phantom or Solflare.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
