"use client";

import { useState, useEffect } from "react";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { ScoutReport } from "@/lib/gemini/schemas";
import ActivityTimeline from "@/components/prestocks/ActivityTimeline";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface MarketCompanyInfoProps {
  product: PreStockDerived;
}

export default function MarketCompanyInfo({ product }: MarketCompanyInfoProps) {
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [loading, setLoading] = useState(false);
  const companyName = getCompanyName(product.name);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      try {
        const res = await fetch(`/api/scout?symbol=${encodeURIComponent(product.symbol)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.report && isMounted) {
            setReport(json.report);
          }
        }
      } catch {
        // Cache miss or network idle
      }
    }
    loadReport();
    return () => {
      isMounted = false;
    };
  }, [product.symbol]);

  const handleGenerateBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: product.symbol, forceRefresh: false }),
      });
      if (res.ok) {
        const json = await res.json();
        setReport(json.report);
        toast("Research brief generated", "success");
      } else {
        throw new Error("Failed to generate research brief");
      }
    } catch {
      toast("Unable to generate research brief at this time", "error");
    } finally {
      setLoading(false);
    }
  };

  const hasMetaFields = Boolean(
    report?.sector || report?.headquarters || report?.foundedYear
  );

  return (
    <div className="space-y-6">
      {/* Company Intelligence Details */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">
              Company Intelligence
            </h2>
            <p className="text-[11px] text-on-surface-variant font-light mt-0.5">
              Profile, fundamentals, and verified disclosures for {companyName}.
            </p>
          </div>

          {!report && (
            <button
              type="button"
              onClick={handleGenerateBrief}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-medium text-on-surface transition-colors disabled:opacity-50"
            >
              <MaterialIcon icon="psychology" size="sm" />
              <span>{loading ? "Researching..." : "Generate Brief"}</span>
            </button>
          )}
        </div>

        {/* Existing Metadata Grid (only renders fields that exist) */}
        {hasMetaFields && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {report?.sector && (
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
                <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80">
                  Sector
                </div>
                <div className="font-headline font-semibold text-xs text-on-surface truncate mt-0.5">
                  {report.sector}
                </div>
              </div>
            )}
            {report?.headquarters && (
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
                <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80">
                  Headquarters
                </div>
                <div className="font-headline font-semibold text-xs text-on-surface truncate mt-0.5">
                  {report.headquarters}
                </div>
              </div>
            )}
            {report?.foundedYear && (
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
                <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80">
                  Founded
                </div>
                <div className="font-mono font-semibold text-xs text-on-surface mt-0.5">
                  {report.foundedYear}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description / Overview */}
        <div className="space-y-1.5 text-xs text-on-surface-variant leading-relaxed font-light">
          {report?.overview ? (
            <p className="whitespace-pre-line">{report.overview}</p>
          ) : product.description ? (
            <p className="whitespace-pre-line">{product.description}</p>
          ) : null}

          {report?.businessModel && (
            <div className="pt-2 border-t border-outline-variant/10">
              <span className="font-label uppercase text-[10px] text-on-surface font-semibold tracking-wider block mb-1">
                Business Model
              </span>
              <p>{report.businessModel}</p>
            </div>
          )}
        </div>

        {/* Notable Corporate Facts */}
        {report?.notableFacts && report.notableFacts.length > 0 && (
          <div className="pt-3 border-t border-outline-variant/10 space-y-2">
            <span className="font-label uppercase text-[10px] text-on-surface-variant/80 font-semibold tracking-wider block">
              Key Fundamentals
            </span>
            <ul className="space-y-1.5 text-xs text-on-surface">
              {report.notableFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <span className="font-light leading-relaxed">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verified Research Sources */}
        {report?.sources && report.sources.length > 0 && (
          <div className="pt-3 border-t border-outline-variant/10 space-y-2">
            <span className="font-label uppercase text-[10px] text-on-surface-variant/80 font-semibold tracking-wider block">
              Research Sources
            </span>
            <div className="flex flex-wrap gap-2">
              {report.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/15 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="font-medium truncate max-w-xs">{s.title}</span>
                  <span className="text-[9px] font-mono text-on-surface-variant/50">({s.domain})</span>
                  <MaterialIcon icon="open_in_new" size="sm" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline (Phase 11) */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">
              Activity
            </h2>
            <p className="text-[11px] text-on-surface-variant font-light mt-0.5">
              Verified corporate announcements, research citations, and protocol events.
            </p>
          </div>
        </div>

        {report?.recentDevelopments && report.recentDevelopments.length > 0 ? (
          <ActivityTimeline events={report.recentDevelopments} />
        ) : (
          <div className="py-8 px-4 text-center rounded-xl bg-surface-container-lowest/40 border border-dashed border-outline-variant/20 space-y-2">
            <div className="text-xs text-on-surface-variant font-light">
              No external news events cached yet for ${product.symbol}.
            </div>
            {!report && (
              <button
                type="button"
                onClick={handleGenerateBrief}
                disabled={loading}
                className="text-xs font-mono text-accent hover:underline"
              >
                {loading ? "Searching..." : "Search latest developments"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
