"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/connector/react";
import { createApiKey, listApiKeys, revokeApiKey, ApiKeyItem } from "@/lib/firebase/apiKeys";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

export default function ApiKeysSettingsPage() {
  const { account } = useWallet();
  const addressStr = account ? (typeof account === "string" ? account : String(account)) : "";
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const { toast } = useToast();

  const loadKeys = useCallback(async () => {
    if (!addressStr) return;
    setLoading(true);
    try {
      const res = await listApiKeys(addressStr);
      setKeys(res);
    } catch {
      toast("Unable to load API keys", "error");
    } finally {
      setLoading(false);
    }
  }, [addressStr, toast]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressStr || creating) return;

    setCreating(true);
    try {
      const res = await createApiKey(addressStr, keyName.trim() || "Default Secret Key");
      if (res) {
        setNewlyCreatedKey(res.rawKey);
        setKeyName("");
        await loadKeys();
        toast("API key generated successfully", "success");
      } else {
        toast("Failed to generate API key", "error");
      }
    } catch {
      toast("API key generation failed", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!addressStr) return;
    try {
      const ok = await revokeApiKey(addressStr, keyId);
      if (ok) {
        toast("API key revoked", "success");
        await loadKeys();
      } else {
        toast("Failed to revoke key", "error");
      }
    } catch {
      toast("Error revoking API key", "error");
    }
  };

  const handleCopyNewKey = () => {
    if (!newlyCreatedKey) return;
    navigator.clipboard.writeText(newlyCreatedKey);
    setCopiedKey(true);
    toast("API key copied to clipboard", "success");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-outline-variant/15">
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          Developer API Keys
        </h1>
        <p className="text-xs text-on-surface-variant font-light">
          Generate and manage secret keys for authenticating with Scouter&apos;s REST API and SDK.
        </p>
      </div>

      {/* Security Warning Notice (Phase 7) */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3 text-xs text-on-surface-variant">
        <MaterialIcon icon="security" size="sm" className="text-accent flex-shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed font-light">
          <span className="font-headline font-semibold text-on-surface block">
            API Key Security Standards
          </span>
          <p>
            Your API keys carry full data access permissions for your connected account. Never commit keys to public GitHub repositories, and never expose secret keys in client-side browser bundles. Always pass them via server-side environment variables (`SCOUTER_API_KEY`).
          </p>
        </div>
      </div>

      {/* Newly Created Key Modal/Banner */}
      {newlyCreatedKey && (
        <div className="p-5 rounded-2xl bg-surface-container border border-accent/40 space-y-3 shadow-lg shadow-black/30 animate-fade-in">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="key" size="sm" className="text-accent" />
            <span className="font-headline font-semibold text-sm text-on-surface">
              Save your API Key Now
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-light">
            Please copy this key immediately and store it securely. For your security, you will not be able to view the raw key again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs px-3 py-2 rounded-xl bg-surface-container-lowest text-accent border border-outline-variant/30 select-all break-all">
              {newlyCreatedKey}
            </code>
            <button
              type="button"
              onClick={handleCopyNewKey}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-surface-container-lowest font-headline font-semibold text-xs hover:brightness-110 transition-all flex-shrink-0"
            >
              <MaterialIcon icon={copiedKey ? "check" : "content_copy"} size="sm" />
              <span>{copiedKey ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={() => setNewlyCreatedKey(null)}
              className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-headline text-on-surface transition-colors flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create New Key Form */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
        <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">
          Create New Key
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="e.g. Production Backend, Local Dev SDK..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-outline-variant/70 font-light"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 transition-all shadow-sm flex-shrink-0 disabled:opacity-50"
          >
            <MaterialIcon icon="add" size="sm" />
            <span>{creating ? "Generating..." : "Generate Key"}</span>
          </button>
        </form>
      </div>

      {/* Keys List */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between">
          <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">
            Your Active &amp; Revoked Keys
          </h2>
          <span className="text-xs font-mono text-on-surface-variant">
            {keys.length} {keys.length === 1 ? "Key" : "Keys"}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-on-surface-variant animate-pulse">
            Loading API keys from Firebase...
          </div>
        ) : keys.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2 text-xs text-on-surface-variant font-light">
            <MaterialIcon icon="vpn_key" size="md" className="mx-auto text-on-surface-variant/50" />
            <p>No API keys generated yet. Create a key to access the Scouter Developer SDK.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10 text-xs font-mono">
            {keys.map((k) => {
              const isRevoked = k.status === "revoked";

              return (
                <div
                  key={k.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-high/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-semibold text-sm text-on-surface">
                        {k.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isRevoked
                            ? "bg-surface-container text-error line-through"
                            : "bg-surface-container text-accent"
                        }`}
                      >
                        {k.status}
                      </span>
                    </div>
                    <div className="text-on-surface-variant/70 text-[11px]">
                      {k.maskedKey} &bull; Created {new Date(k.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {!isRevoked && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-error hover:bg-surface-container-high border border-outline-variant/20 text-xs font-headline font-medium transition-colors self-start sm:self-auto"
                    >
                      <MaterialIcon icon="block" size="sm" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
