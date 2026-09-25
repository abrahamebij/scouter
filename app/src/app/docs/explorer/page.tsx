"use client";

import { useState } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface EndpointDef {
  method: "GET";
  path: string;
  title: string;
  description: string;
  params: string[];
}

const ENDPOINTS: EndpointDef[] = [
  {
    method: "GET",
    path: "/api/markets",
    title: "List All Markets",
    description: "Returns all active PreStocks tokenised private companies on Solana.",
    params: [],
  },
  {
    method: "GET",
    path: "/api/markets/openai",
    title: "Get OpenAI Market",
    description: "Fetches live token pricing, implied valuation, and benchmark mark for OpenAI.",
    params: ["symbol (optional, defaults to openai)"],
  },
  {
    method: "GET",
    path: "/api/markets/openai/history",
    title: "Get Market History",
    description: "Retrieves recorded snapshot observation data points.",
    params: ["symbol (optional, defaults to openai)"],
  },
];

export default function ApiExplorerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [customPath, setCustomPath] = useState(ENDPOINTS[0].path);
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const { toast } = useToast();

  const handleSelect = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setResponseJson(null);
    setResponseStatus(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseJson(null);
    setResponseStatus(null);
    try {
      const res = await fetch(customPath);
      setResponseStatus(res.status);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
      toast(`Received HTTP ${res.status}`, res.ok ? "success" : "error");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setResponseStatus(500);
      setResponseJson(JSON.stringify({ error: msg }, null, 2));
      toast("Request execution failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const curlCommand = `curl -X GET "${typeof window !== "undefined" ? window.location.origin : "https://scouter-tool.vercel.app"}${customPath}" \\
     -H "Accept: application/json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    toast("cURL command copied to clipboard", "success");
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          Interactive Testing
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          API Explorer
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Test live Scouter REST API endpoints directly from your browser with real-time JSON inspection.
        </p>
      </div>

      {/* Grid: Selector + Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Endpoint Selector List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/70 font-semibold px-1">
            Available Endpoints
          </div>
          {ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.path === ep.path;
            return (
              <button
                key={ep.path}
                type="button"
                onClick={() => handleSelect(ep)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isSelected
                    ? "bg-surface-container-high border-outline-variant/40 shadow-xs"
                    : "bg-surface-container-low border-outline-variant/15 hover:bg-surface-container-high/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                    {ep.method}
                  </span>
                  <span className="font-headline font-semibold text-xs text-on-surface">
                    {ep.title}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-on-surface-variant truncate">
                  {ep.path}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Playground */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
            <div className="space-y-1">
              <h2 className="font-headline font-bold text-base text-on-surface">
                {selectedEndpoint.title}
              </h2>
              <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                {selectedEndpoint.description}
              </p>
            </div>

            {/* URL Bar & Try It */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-2 flex-1 px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 font-mono text-xs">
                <span className="text-accent font-bold">GET</span>
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="flex-1 bg-transparent text-on-surface focus:outline-none font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleExecute}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 transition-all shadow-sm flex-shrink-0 disabled:opacity-50"
              >
                <MaterialIcon icon={loading ? "autorenew" : "play_arrow"} size="sm" className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Running..." : "Send Request"}</span>
              </button>
            </div>

            {/* cURL Snippet */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
                <span>cURL Command</span>
                <button
                  type="button"
                  onClick={handleCopyCurl}
                  className="inline-flex items-center gap-1 text-accent hover:underline lowercase"
                >
                  <MaterialIcon icon={copiedCurl ? "check" : "content_copy"} size="sm" />
                  <span>{copiedCurl ? "copied" : "copy"}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
                {curlCommand}
              </pre>
            </div>

            {/* Response Viewer */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
                <span>Response Body</span>
                {responseStatus && (
                  <span
                    className={`font-mono font-bold ${
                      responseStatus < 300 ? "text-accent" : "text-error"
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto min-h-[160px] max-h-96">
                {responseJson || "// Click 'Send Request' to execute live API call..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
