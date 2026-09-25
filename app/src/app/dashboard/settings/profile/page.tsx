"use client";

import { useState } from "react";
import { useWallet } from "@solana/connector/react";
import { useFirebaseAuth } from "@/lib/firebase/useFirebaseAuth";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

export default function ProfileSettingsPage() {
  const { account } = useWallet();
  const { profile, isSyncing } = useFirebaseAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const addressStr = account ? (typeof account === "string" ? account : String(account)) : "";

  const handleCopy = () => {
    if (!addressStr) return;
    navigator.clipboard.writeText(addressStr);
    setCopied(true);
    toast("Wallet address copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressStr || !displayName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: addressStr,
          displayName: displayName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Profile updated successfully in Firebase", "success");
      } else {
        toast(data.error || "Failed to update profile", "error");
      }
    } catch {
      toast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-outline-variant/15">
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          Wallet Profile &amp; Identity
        </h1>
        <p className="text-xs text-on-surface-variant font-light">
          Authenticated via Solana wallet. Profile and user settings are synchronized with Firebase Firestore.
        </p>
      </div>

      {/* Identity Card */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-accent">
            <MaterialIcon icon="account_balance_wallet" size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-base text-on-surface">
                {profile?.displayName || "Solana Explorer"}
              </span>
              <span className="text-[10px] font-mono text-accent font-semibold px-2 py-0.5 rounded bg-surface-container border border-outline-variant/20">
                Verified
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-on-surface-variant break-all">
                {addressStr}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
                title="Copy address"
              >
                <MaterialIcon icon={copied ? "check" : "content_copy"} size="sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Firebase Sync Status */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? "bg-secondary animate-pulse" : "bg-accent"}`} />
            <span className="text-on-surface-variant">
              Firebase Firestore: {isSyncing ? "Syncing..." : "Connected & Synchronized"}
            </span>
          </div>

          <div className="font-mono text-[11px] text-on-surface-variant/70">
            Cluster: mainnet-beta
          </div>
        </div>

        {/* Display Name Form */}
        <form onSubmit={handleSaveName} className="space-y-4 pt-2 border-t border-outline-variant/10">
          <div>
            <label className="block text-[11px] font-label uppercase tracking-wider text-on-surface-variant font-medium mb-1.5">
              Display Name / Alias
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.displayName || "Enter your trader or researcher alias..."}
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-outline-variant/70 font-light"
            />
          </div>

          <button
            type="submit"
            disabled={!displayName.trim() || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors disabled:opacity-50"
          >
            <MaterialIcon icon="save" size="sm" />
            <span>{saving ? "Saving..." : "Update Alias"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
