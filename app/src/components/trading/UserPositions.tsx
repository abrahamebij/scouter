"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTrading } from "@/lib/hooks/useTrading";
import { useToast } from "@/components/ui/Toast";
import { toSymbol } from "@/lib/config/hyperliquid";
import type { UserPosition, UserOrder } from "@/lib/hyperliquid/types";

type TabType = "positions" | "orders" | "history";

export default function UserPositions() {
  const { isConnected } = useAccount();
  const { positions, orders, submitCancel, closePosition } = useTrading();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("positions");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [closingCoin, setClosingCoin] = useState<string | null>(null);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "positions", label: "Positions", count: positions.length || undefined },
    { id: "orders", label: "Orders", count: orders.length || undefined },
    { id: "history", label: "Trade History" },
  ];

  const handleCancel = async (order: UserOrder) => {
    setCancellingId(order.oid);
    const result = await submitCancel(toSymbol(order.coin), order.oid);
    if (result.success) {
      toast("Order cancelled", "success");
    } else {
      toast(result.error ?? "Failed to cancel", "error");
    }
    setCancellingId(null);
  };

  const handleClose = async (position: UserPosition) => {
    setClosingCoin(position.coin);
    const result = await closePosition(position);
    if (result.success) {
      toast(`Closing ${toSymbol(position.coin)} position`, "success");
    } else {
      toast(result.error ?? "Failed to close position", "error");
    }
    setClosingCoin(null);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center border-b border-outline-variant/10 flex-shrink-0 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-label uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary -mb-px"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
            {tab.count ? (
              <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!isConnected ? (
          <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant">
            Connect wallet to view positions
          </div>
        ) : activeTab === "positions" ? (
          <PositionsTable
            positions={positions}
            onClose={handleClose}
            closingCoin={closingCoin}
          />
        ) : activeTab === "orders" ? (
          <OrdersTable
            orders={orders}
            onCancel={handleCancel}
            cancellingId={cancellingId}
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-on-surface-variant">
            Trade history coming soon
          </div>
        )}
      </div>
    </div>
  );
}

function PositionsTable({
  positions,
  onClose,
  closingCoin,
}: {
  positions: UserPosition[];
  onClose: (position: UserPosition) => void;
  closingCoin: string | null;
}) {
  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="text-base text-on-surface-variant">No open positions</span>
        <span className="text-xs text-on-surface-variant/60">
          Place a trade to open a position
        </span>
      </div>
    );
  }

  return (
    <table className="w-full text-left">
      <thead className="sticky top-0 bg-surface-container-lowest">
        <tr className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/5">
          <th className="py-2 px-3 font-medium">Symbol</th>
          <th className="py-2 px-3 font-medium">Side</th>
          <th className="py-2 px-3 font-medium text-right">Size</th>
          <th className="py-2 px-3 font-medium text-right">Entry</th>
          <th className="py-2 px-3 font-medium text-right">Liq. Price</th>
          <th className="py-2 px-3 font-medium text-right">PnL</th>
          <th className="py-2 px-3 font-medium text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((pos) => {
          const szi = parseFloat(pos.szi);
          const isLong = szi > 0;
          const pnl = parseFloat(pos.unrealizedPnl);
          const isProfitable = pnl >= 0;
          const displayCoin = toSymbol(pos.coin);
          const leverageType = pos.leverage?.type === "cross" ? "Cross" : `${pos.leverage?.value ?? "?"}x`;

          return (
            <tr
              key={pos.coin}
              className="text-[13px] font-label hover:bg-surface-container/30 transition-colors border-b border-outline-variant/5"
            >
              <td className="py-2 px-3 font-bold text-on-surface">
                {displayCoin}
              </td>
              <td className="py-2.5 px-3">
                <span className={isLong ? "text-primary" : "text-error"}>
                  {isLong ? "Long" : "Short"}
                </span>
                <span className="text-on-surface-variant ml-1 text-[11px]">
                  {leverageType}
                </span>
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-on-surface">
                {Math.abs(szi).toFixed(4)}
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-on-surface-variant">
                ${parseFloat(pos.entryPx).toFixed(2)}
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-on-surface-variant">
                {pos.liquidationPx ? `$${parseFloat(pos.liquidationPx).toFixed(2)}` : "—"}
              </td>
              <td
                className={`py-2 px-3 text-right tabular-nums font-bold ${
                  isProfitable ? "text-primary" : "text-error"
                }`}
              >
                {isProfitable ? "+" : ""}${pnl.toFixed(2)}
                {pos.returnOnEquity && (
                  <span className="text-[10px] font-normal ml-1">
                    ({(parseFloat(pos.returnOnEquity) * 100).toFixed(1)}%)
                  </span>
                )}
              </td>
              <td className="py-2 px-3 text-right">
                <button
                  onClick={() => onClose(pos)}
                  disabled={closingCoin === pos.coin}
                  className="px-3 py-1.5 rounded bg-surface-container-high text-on-surface text-[11px] font-bold hover:bg-primary/80 hover:text-black transition-colors disabled:opacity-50"
                >
                  {closingCoin === pos.coin ? "Closing..." : "Close"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OrdersTable({
  orders,
  onCancel,
  cancellingId,
}: {
  orders: UserOrder[];
  onCancel: (order: UserOrder) => void;
  cancellingId: number | null;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="text-base text-on-surface-variant">No open orders</span>
        <span className="text-xs text-on-surface-variant/60">
          Limit orders will appear here
        </span>
      </div>
    );
  }

  return (
    <table className="w-full text-left">
      <thead className="sticky top-0 bg-surface-container-lowest">
        <tr className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/5">
          <th className="py-2 px-3 font-medium">Symbol</th>
          <th className="py-2 px-3 font-medium">Side</th>
          <th className="py-2 px-3 font-medium text-right">Price</th>
          <th className="py-2 px-3 font-medium text-right">Size</th>
          <th className="py-2 px-3 font-medium text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const isBuy = order.side === "B";
          const displayCoin = toSymbol(order.coin);
          const total = parseFloat(order.limitPx) * parseFloat(order.sz);

          return (
            <tr
              key={order.oid}
              className="text-[13px] font-label hover:bg-surface-container/30 transition-colors border-b border-outline-variant/5"
            >
              <td className="py-2 px-3 font-bold text-on-surface">
                {displayCoin}
              </td>
              <td className="py-2 px-3">
                <span className={isBuy ? "text-primary" : "text-error"}>
                  {isBuy ? "Long" : "Short"}
                </span>
              </td>
              <td className="py-2 px-3 text-right tabular-nums">
                ${parseFloat(order.limitPx).toFixed(2)}
              </td>
              <td className="py-2 px-3 text-right tabular-nums">
                {parseFloat(order.sz).toFixed(4)}
                <span className="text-on-surface-variant ml-1 text-[11px]">
                  (${total.toFixed(2)})
                </span>
              </td>
              <td className="py-2 px-3 text-right">
                <button
                  onClick={() => onCancel(order)}
                  disabled={cancellingId === order.oid}
                  className="px-3 py-1.5 rounded bg-surface-container-high text-error text-[11px] font-bold hover:bg-error/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  {cancellingId === order.oid ? "..." : "Cancel"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
