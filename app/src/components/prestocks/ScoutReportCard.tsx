"use client";

import { useState, useEffect, useCallback } from "react";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { ScoutReport } from "@/lib/gemini/schemas";
import ActivityTimeline from "./ActivityTimeline";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface ScoutReportCardProps {
  product: PreStockDerived;
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ScoutReportCard({ product }: ScoutReportCardProps) {
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const companyName = getCompanyName(product.name);

  // Check if a report was already cached on the server on initial mount
  useEffect(() => {
    let isMounted = true;
    async function checkCache() {
      try {
        const res = await fetch(`/api/scout?symbol=${encodeURIComponent(product.symbol)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.report && isMounted) {
            setReport(json.report);
          }
        }
      } catch {
        // Cache miss or network idle, wait for user to click Scout
      }
    }
    checkCache();
    return () => {
      isMounted = false;
    };
  }, [product.symbol]);

  const handleScout = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/scout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: product.symbol, forceRefresh }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Scout engine returned status ${res.status}`);
        }

        const data = await res.json();
        setReport(data.report);
        if (forceRefresh) {
          toast("Scout research report refreshed", "success");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to run scout engine";
        setError(msg);
        toast("Unable to complete research brief", "error");
      } finally {
        setLoading(false);
      }
    },
    [product.symbol, toast]
  );

  // Uninitialized state: prominent "Scout this company" CTA
  if (!report && !loading && !error) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface">
          <MaterialIcon icon="radar" size="md" />
        </div>

        <div className="space-y-1">
          <h3 className="font-headline font-bold text-lg text-on-surface">
            Scout {companyName}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto font-light leading-relaxed">
            Generate an AI-powered research brief using Google Search Grounding to discover recent announcements, business model fundamentals, and verified public sources.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => handleScout(false)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 shadow-sm transition-all"
          >
            <MaterialIcon icon="psychology" size="sm" />
            <span>Generate Scout Research Brief</span>
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-6 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
          <div className="space-y-2">
            <div className="h-5 bg-surface-container-high rounded w-48" />
            <div className="h-3 bg-surface-container-high/60 rounded w-64" />
          </div>
          <div className="h-8 bg-surface-container-high rounded-lg w-28" />
        </div>

        <div className="space-y-2.5">
          <div className="h-4 bg-surface-container-high/80 rounded w-full" />
          <div className="h-4 bg-surface-container-high/80 rounded w-5/6" />
          <div className="h-4 bg-surface-container-high/60 rounded w-4/6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-container-lowest rounded-xl border border-outline-variant/10" />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 pt-4 text-xs font-mono text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Grounding live web intelligence with Google Gemini...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !report) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
          <MaterialIcon icon="error_outline" size="md" />
        </div>
        <div className="space-y-1">
          <h3 className="font-headline font-semibold text-base text-on-surface">
            Research Brief Temporarily Unavailable
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto font-light">
            Scouter could not complete the Gemini intelligence query. Live PreStocks secondary market pricing remains active.
          </p>
        </div>
        <div className="text-[11px] font-mono text-on-surface-variant/70 p-2 rounded bg-surface-container-lowest border border-outline-variant/20 max-w-sm mx-auto break-all">
          {error}
        </div>
        <button
          onClick={() => handleScout(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors"
        >
          <MaterialIcon icon="refresh" size="sm" />
          <span>Retry Research</span>
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 space-y-8 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/15">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-surface-container-high flex items-center justify-center text-on-surface">
              <MaterialIcon icon="psychology" size="sm" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Scout Intelligence Brief
            </h3>
            <span className="text-[10px] font-label uppercase tracking-widest text-accent bg-accent/8 border border-accent/20 px-2 py-0.5 rounded">
              Grounded
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-light">
            Synthesized via Gemini with verified Google Search Grounding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-on-surface-variant/70">
            {formatTimeAgo(report.generatedAt)}
          </span>
          <button
            onClick={() => handleScout(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-medium text-on-surface transition-colors"
            title="Force refresh research with live search grounding"
          >
            <MaterialIcon icon="refresh" size="sm" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Structured Meta Pills (Sector, Year, HQ, Business Model) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {report.sector && (
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
              Sector
            </div>
            <div className="font-headline font-semibold text-on-surface truncate">
              {report.sector}
            </div>
          </div>
        )}

        {report.foundedYear && (
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
              Founded
            </div>
            <div className="font-mono font-semibold text-on-surface">
              {report.foundedYear}
            </div>
          </div>
        )}

        {report.headquarters && (
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
              Headquarters
            </div>
            <div className="font-headline font-semibold text-on-surface truncate">
              {report.headquarters}
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
            PreStocks Implied Val
          </div>
          <div className="font-mono font-bold text-accent">
            ${(product.impliedValuation / 1e9).toFixed(1)}B
          </div>
        </div>
      </div>

      {/* Overview & Business Model */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface-variant font-semibold">
            Company Overview
          </h4>
          <p className="text-sm text-on-surface leading-relaxed font-light">
            {report.overview}
          </p>
        </div>

        {report.businessModel && (
          <div className="space-y-1.5 pt-2">
            <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface-variant font-semibold">
              Business Model
            </h4>
            <p className="text-sm text-on-surface leading-relaxed font-light">
              {report.businessModel}
            </p>
          </div>
        )}
      </div>

      {/* Notable Facts */}
      {report.notableFacts && report.notableFacts.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-outline-variant/10">
          <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface-variant font-semibold">
            Key Corporate Fundamentals
          </h4>
          <ul className="space-y-2 text-xs text-on-surface">
            {report.notableFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/80 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed font-light">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Activity Timeline (Phases 30-32) */}
      <div className="space-y-4 pt-4 border-t border-outline-variant/10">
        <div className="flex items-center justify-between">
          <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface-variant font-semibold">
            Recent Activity &amp; Catalyst Timeline
          </h4>
          <span className="text-[11px] font-mono text-on-surface-variant/70">
            Verified Public Announcements
          </span>
        </div>
        <ActivityTimeline events={report.recentDevelopments} />
      </div>

      {/* Grounded Citation Sources (Phase 25) */}
      {report.sources && report.sources.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-outline-variant/10">
          <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface-variant font-semibold">
            Grounding Citations &amp; Sources
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {report.sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/15 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="font-medium truncate max-w-xs">{s.title}</span>
                <span className="text-[10px] font-mono text-on-surface-variant/60">
                  ({s.domain})
                </span>
                <MaterialIcon icon="open_in_new" size="sm" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
