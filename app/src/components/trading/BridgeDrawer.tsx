"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";
import { BRIDGE_SOURCE_CHAINS } from "@/lib/config/xstocks";
import { useBridge } from "@/lib/hooks/useBridge";
import type { Route, LiFiStepExtended } from "@lifi/sdk";
import type { TradeMode } from "@/lib/spot/types";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

interface BridgeDrawerProps {
  isOpen: boolean;
  mode: TradeMode;
  onClose: () => void;
  onBridgeComplete?: () => void;
}

interface RouteToolDetails {
  key: string;
  name: string;
  logoURI: string;
}

interface RouteEstimateGasCost {
  amountUSD?: string;
}

interface RouteEstimate {
  executionDuration?: number;
  gasCosts?: RouteEstimateGasCost[];
}

type RouteDisplay = Route & {
  estimate?: RouteEstimate;
  steps: Array<LiFiStepExtended & { estimate?: RouteEstimate }>;
};

interface RouteCardView {
  route: RouteDisplay;
  routeKey: string;
  toAmount: string;
  toAmountNumber: number;
  duration?: number;
  gasUsd?: string;
  primaryTool: RouteToolDetails;
  tools: RouteToolDetails[];
  isBestOutput: boolean;
  isFastest: boolean;
}

export default function BridgeDrawer({
  isOpen,
  mode,
  onClose,
  onBridgeComplete,
}: BridgeDrawerProps) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const bridge = useBridge(mode);

  const [sourceChainId, setSourceChainId] = useState<number>(
    BRIDGE_SOURCE_CHAINS[0].chainId
  );
  const [amount, setAmount] = useState("");
  const [sourceBalance, setSourceBalance] = useState<string | null>(null);

  const sourceChain = BRIDGE_SOURCE_CHAINS.find((chain) => chain.chainId === sourceChainId);
  const sourcePublicClient = usePublicClient({ chainId: sourceChainId });

  useEffect(() => {
    if (!address || !sourceChain || !sourcePublicClient) {
      return;
    }

    let isActive = true;

    const loadBalance = async () => {
      try {
        const balance = await sourcePublicClient.readContract({
          address: sourceChain.usdc,
          abi: ERC20_BALANCE_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        if (!isActive) {
          return;
        }

        setSourceBalance(formatUnits(balance, 6));
      } catch {
        if (!isActive) {
          return;
        }

        setSourceBalance(null);
      }
    };

    void loadBalance();

    return () => {
      isActive = false;
    };
  }, [address, sourceChain, sourcePublicClient]);

  const routeViews = useMemo<RouteCardView[]>(() => {
    const views = bridge.routes.map((route, index) => {
      const routeView = route as RouteDisplay;
      const toAmount = formatUnits(
        BigInt(routeView.toAmount),
        bridge.destination.token.decimals
      );
      const toAmountNumber = Number.parseFloat(toAmount) || 0;
      const duration =
        routeView.steps?.[0]?.estimate?.executionDuration ??
        routeView.estimate?.executionDuration;
      const gasUsd =
        routeView.gasCostUSD ?? routeView.steps?.[0]?.estimate?.gasCosts?.[0]?.amountUSD;
      const tools = getRouteTools(routeView);

      return {
        route: routeView,
        routeKey: routeView.id ?? `${tools[0]?.key ?? "bridge"}-${index}`,
        toAmount,
        toAmountNumber,
        duration,
        gasUsd,
        primaryTool: tools[0] ?? {
          key: "bridge",
          name: "Bridge",
          logoURI: "",
        },
        tools,
        isBestOutput: false,
        isFastest: false,
      };
    });

    if (views.length === 0) {
      return views;
    }

    const bestOutput = views.reduce((best, view) => {
      return view.toAmountNumber > best.toAmountNumber ? view : best;
    }, views[0]);

    const fastest = views.reduce((best, view) => {
      if (view.duration == null) return best;
      if (best.duration == null || view.duration < best.duration) return view;
      return best;
    }, views[0]);

    return views
      .map((view) => ({
        ...view,
        isBestOutput: view.routeKey === bestOutput.routeKey,
        isFastest: fastest != null && view.routeKey === fastest.routeKey,
      }))
      .sort((a, b) => {
        if (a.isBestOutput !== b.isBestOutput) return a.isBestOutput ? -1 : 1;
        if (a.isFastest !== b.isFastest) return a.isFastest ? -1 : 1;
        return b.toAmountNumber - a.toAmountNumber;
      });
  }, [bridge.destination.token.decimals, bridge.routes]);

  const handleGetRoutes = () => {
    const amountNum = parseFloat(amount || "0");
    if (amountNum <= 0) {
      toast("Enter a valid amount", "warning");
      return;
    }
    const amountWei = bridge.parseBridgeAmount(amount);
    bridge.getRoutes(sourceChainId, amountWei);
  };

  const handleExecute = async () => {
    const didSucceed = await bridge.execute();
    if (didSucceed) {
      toast(
        mode === "perp"
          ? "Perp funding complete. Funds moved to Hyperliquid XYZ."
          : bridge.destination.completionMessage,
        "success"
      );
      onBridgeComplete?.();
    }
  };

  const handleClose = () => {
    bridge.reset();
    setAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />

      <div className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-surface-container-lowest border-l border-outline-variant/10 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2.5">
            <MaterialIcon icon="swap_calls" size="md" className="text-primary" />
            <span className="font-headline font-bold text-base text-on-surface">
              {bridge.destination.title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-colors"
          >
            <MaterialIcon icon="close" size="sm" className="text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2.5">
              From Chain
            </label>
            <div className="grid grid-cols-1 gap-2">
              {BRIDGE_SOURCE_CHAINS.map((chain) => (
                <button
                  key={chain.chainId}
                  onClick={() => setSourceChainId(chain.chainId)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                    sourceChainId === chain.chainId
                      ? "border-primary/30 bg-primary/5"
                      : "border-outline-variant/15 hover:border-outline-variant/30 hover:bg-surface-container/50"
                  }`}
                >
                  <Image
                    src={chain.icon}
                    alt={chain.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="font-label text-sm text-on-surface font-bold">
                    {chain.name}
                  </span>
                  {sourceChainId === chain.chainId && (
                    <MaterialIcon
                      icon="check"
                      size="sm"
                      className="text-primary ml-auto"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2.5">
              Amount (USDC)
            </label>
            <div className="flex bg-surface-container rounded-lg border border-outline-variant/20 focus-within:border-primary transition-colors">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-no-spin flex-1 bg-transparent px-4 py-2.5 text-base font-label outline-none"
                placeholder="0"
                step="1"
              />
              <span className="px-4 py-2.5 text-sm font-label text-on-surface-variant border-l border-outline-variant/20">
                USDC
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-label text-on-surface-variant">
              <span>
                {sourceBalance != null && sourceChain
                  ? `${sourceChain.name} balance: ${Number(sourceBalance).toFixed(2)} USDC`
                  : "Source balance unavailable"}
              </span>
              {sourceBalance != null ? (
                <button
                  onClick={() => setAmount(Number(sourceBalance).toFixed(2))}
                  className="text-primary hover:underline"
                >
                  Max
                </button>
              ) : null}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {["10", "50", "100", "500"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="py-1.5 rounded-lg bg-surface-container text-sm font-label text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/10">
            {mode === "spot" ? (
              <Image
                src="/chains/ink.svg"
                alt={bridge.destination.chainName}
                width={24}
                height={24}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcon icon="candlestick_chart" size="sm" />
              </div>
            )}
            <div>
              <span className="font-label text-sm text-on-surface font-bold block">
                {bridge.destination.chainName}
              </span>
              <span className="text-xs font-label text-on-surface-variant">
                {bridge.destination.chainDescription}
              </span>
            </div>
          </div>

          {mode === "perp" ? (
            <div className="rounded-lg border border-outline-variant/10 bg-surface-container px-4 py-3 space-y-3">
              <div className="flex items-center justify-between text-sm font-label">
                <span className="text-on-surface-variant">Hyperliquid Core</span>
                <span className="font-bold text-on-surface">
                  {Number(bridge.coreBalance).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-label">
                <span className="text-on-surface-variant">Hyperliquid XYZ</span>
                <span className="font-bold text-on-surface">
                  {Number(bridge.xyzBalance).toFixed(2)} USDC
                </span>
              </div>
              <button
                onClick={async () => {
                  const didMove = await bridge.moveAvailableCoreBalanceToXyz();
                  if (didMove) {
                    toast("Moved available Hyperliquid Core balance into XYZ.", "success");
                    onBridgeComplete?.();
                  }
                }}
                disabled={bridge.isMovingCoreBalance || Number(bridge.coreBalance) <= 0}
                className="w-full py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label font-bold text-sm hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bridge.isMovingCoreBalance
                  ? "Moving Core Balance..."
                  : `Move ${Number(bridge.coreBalance).toFixed(2)} USDC to XYZ`}
              </button>
            </div>
          ) : null}

          {bridge.routes.length === 0 && bridge.status !== "executing" && bridge.status !== "done" && (
            <button
              onClick={handleGetRoutes}
              disabled={
                bridge.isQuoting || !isConnected || !amount || parseFloat(amount) <= 0
              }
              className="w-full py-3 rounded-xl primary-gradient text-on-primary font-headline font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bridge.isQuoting ? "Finding Routes..." : "Get Bridge Routes"}
            </button>
          )}

          {bridge.routes.length > 0 && bridge.status === "idle" && (
            <div className="space-y-3">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                Available Routes
              </label>
              {routeViews.map((view) => {
                const isSelected = bridge.selectedRoute === view.route;

                return (
                  <button
                    key={view.routeKey}
                    onClick={() => bridge.setSelectedRoute(view.route as Route)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary/30 bg-primary/5"
                        : "border-outline-variant/15 hover:border-outline-variant/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <ProtocolIconStack tools={view.tools} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-label text-sm font-bold text-on-surface">
                                {view.primaryTool.name}
                              </span>
                              {view.isBestOutput ? <RouteBadge label="Best output" /> : null}
                              {view.isFastest ? <RouteBadge label="Fastest" /> : null}
                            </div>
                            <span className="text-xs font-label text-on-surface-variant">
                              {view.tools.length > 1
                                ? `${view.tools.length} protocol route`
                                : "Single protocol route"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block font-label text-sm font-bold text-primary">
                          {view.toAmountNumber.toFixed(2)} USDC
                        </span>
                        <span className="text-xs font-label text-on-surface-variant">
                          Gas: ${view.gasUsd ?? "?"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs font-label text-on-surface-variant">
                      <span>{view.duration != null ? `~${view.duration}s` : "Route available"}</span>
                      <span>{formatRouteSummary(view.tools)}</span>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={handleExecute}
                disabled={!bridge.selectedRoute}
                className="w-full py-3 rounded-xl primary-gradient text-on-primary font-headline font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bridge.destination.actionLabel} with {amount} USDC
              </button>
            </div>
          )}

          {(bridge.status === "executing" || bridge.status === "done") && (
            <div className="space-y-3">
              <div
                className={`flex items-start gap-2.5 text-sm font-body rounded-lg px-4 py-3 border ${
                  bridge.status === "done"
                    ? "bg-primary/5 border-primary/10"
                    : "bg-secondary/5 border-secondary/10"
                }`}
              >
                <MaterialIcon
                  icon={bridge.status === "done" ? "check_circle" : "hourglass_empty"}
                  size="sm"
                  className={`mt-0.5 flex-shrink-0 ${
                    bridge.status === "done" ? "text-primary" : "text-secondary"
                  }`}
                />
                <div className="text-on-surface-variant">
                  <span className="font-bold text-on-surface block mb-0.5">
                    {bridge.status === "done" ? "Bridge Complete" : "Bridging..."}
                  </span>
                  <span className="text-xs">{bridge.message}</span>
                  {bridge.txHash ? (
                    mode === "perp" ? (
                      <a
                        href={getHyperliquidTxUrl(bridge.txHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-xs text-primary hover:underline break-all"
                      >
                        Bridge Tx: {bridge.txHash.slice(0, 10)}...{bridge.txHash.slice(-8)}
                      </a>
                    ) : (
                      <span className="mt-1 block text-xs text-on-surface-variant break-all">
                        Tx: {bridge.txHash.slice(0, 10)}...{bridge.txHash.slice(-8)}
                      </span>
                    )
                  ) : null}
                  {bridge.fundingTxHash ? (
                    <a
                      href={getHyperliquidTxUrl(bridge.fundingTxHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs text-primary hover:underline break-all"
                    >
                      XYZ Transfer: {bridge.fundingTxHash.slice(0, 10)}...{bridge.fundingTxHash.slice(-8)}
                    </a>
                  ) : null}
                </div>
              </div>

              {bridge.status === "done" && (
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold text-sm hover:bg-surface-container transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          )}

          {bridge.error && (
            <div className="flex items-start gap-2.5 text-sm font-body text-error/80 bg-error/5 rounded-lg px-4 py-2.5 border border-error/10">
              <MaterialIcon
                icon="error"
                size="sm"
                className="text-error mt-0.5 flex-shrink-0"
              />
              <div>
                <span>{bridge.error}</span>
                <button
                  onClick={bridge.reset}
                  className="block text-primary text-xs hover:underline mt-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProtocolIconStack({ tools }: { tools: RouteToolDetails[] }) {
  const visibleTools = tools.slice(0, 3);
  const overflowCount = tools.length - visibleTools.length;

  return (
    <div className="flex items-center">
      {visibleTools.map((tool, index) => (
        <div
          key={`${tool.key}-${index}`}
          className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant/15 bg-surface-container-high ${index > 0 ? "-ml-2" : ""}`}
        >
          {tool.logoURI ? (
            <Image
              src={tool.logoURI}
              alt={tool.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <MaterialIcon icon="hub" size="sm" className="text-on-surface-variant" />
          )}
        </div>
      ))}
      {overflowCount > 0 ? (
        <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/15 bg-surface-container text-[10px] font-label text-on-surface-variant">
          +{overflowCount}
        </div>
      ) : null}
    </div>
  );
}

function RouteBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-label uppercase tracking-wide text-primary">
      {label}
    </span>
  );
}

function getRouteTools(route: RouteDisplay): RouteToolDetails[] {
  const toolMap = new Map<string, RouteToolDetails>();

  for (const step of route.steps ?? []) {
    const detail = step.toolDetails;
    if (detail?.key) {
      toolMap.set(detail.key, detail);
      continue;
    }

    const fallbackTool = step.tool ?? "bridge";
    if (!toolMap.has(fallbackTool)) {
      toolMap.set(fallbackTool, {
        key: fallbackTool,
        name: formatToolName(fallbackTool),
        logoURI: "",
      });
    }
  }

  if (toolMap.size === 0) {
    const fallbackTool = "bridge";
    toolMap.set(fallbackTool, {
      key: fallbackTool,
      name: formatToolName(fallbackTool),
      logoURI: "",
    });
  }

  return Array.from(toolMap.values());
}

function formatRouteSummary(tools: RouteToolDetails[]): string {
  if (tools.length === 1) {
    return tools[0]?.name ?? "Bridge";
  }

  const [first, second] = tools;
  if (!first || !second) {
    return "Multi-step route";
  }

  return `${first.name} → ${second.name}${tools.length > 2 ? " → ..." : ""}`;
}

function formatToolName(tool: string): string {
  return tool
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getHyperliquidTxUrl(txHash: string): string {
  return `https://app.hyperliquid.xyz/explorer/tx/${txHash}`;
}
