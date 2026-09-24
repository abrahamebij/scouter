"use client";

import { useRef, useEffect, useCallback } from "react";

interface PayoffDiagramProps {
  symbol: string;
  strike: number;
  totalDebit: number;
  contracts: number;
  avgMove: number;
}

export default function PayoffDiagram({
  symbol,
  strike,
  totalDebit,
  contracts,
}: PayoffDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || strike <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0a0f0e";
    ctx.fillRect(0, 0, w, h);

    const padLeft = 58;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 38;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const rangePct = 0.20;
    const pMin = strike * (1 - rangePct);
    const pMax = strike * (1 + rangePct);
    const multiplier = contracts * 100;
    const maxLoss = -totalDebit * multiplier;
    const maxProfitAtRange = (strike * rangePct - totalDebit) * multiplier;
    const plMin = maxLoss * 1.4;
    const plMax = maxProfitAtRange * 1.05;

    const toX = (price: number) => padLeft + ((price - pMin) / (pMax - pMin)) * chartW;
    const toY = (pl: number) => padTop + chartH - ((pl - plMin) / (plMax - plMin)) * chartH;

    const stradplePL = (price: number) => {
      const callPL = Math.max(price - strike, 0) - totalDebit / 2;
      const putPL = Math.max(strike - price, 0) - totalDebit / 2;
      return (callPL + putPL) * multiplier;
    };

    ctx.font = "10px 'Space Grotesk', sans-serif";

    const beUp = strike + totalDebit;
    const beDown = strike - totalDebit;
    const zeroY = toY(0);
    const maxLossY = toY(maxLoss);

    // --- Y axis (P&L) ---
    ctx.strokeStyle = "rgba(60, 74, 66, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.stroke();

    // Y-axis ticks & labels
    const yTicks = 5;
    ctx.textAlign = "right";
    ctx.fillStyle = "#7a8a80";
    ctx.font = "9px 'Space Grotesk', sans-serif";
    for (let i = 0; i <= yTicks; i++) {
      const pl = plMin + (i / yTicks) * (plMax - plMin);
      const y = toY(pl);
      // Tick mark
      ctx.strokeStyle = "rgba(60, 74, 66, 0.15)";
      ctx.beginPath();
      ctx.moveTo(padLeft - 4, y);
      ctx.lineTo(padLeft, y);
      ctx.stroke();
      // Horizontal grid line
      ctx.strokeStyle = "rgba(60, 74, 66, 0.08)";
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      // Label
      const label = pl >= 0 ? `+$${(pl / 1000).toFixed(0)}k` : `-$${(Math.abs(pl) / 1000).toFixed(0)}k`;
      const shortLabel = Math.abs(pl) >= 1000 ? label : (pl >= 0 ? `+$${pl.toFixed(0)}` : `-$${Math.abs(pl).toFixed(0)}`);
      ctx.fillText(shortLabel, padLeft - 7, y + 3);
    }

    // Zero line (highlighted)
    ctx.strokeStyle = "rgba(102, 212, 246, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padLeft, zeroY);
    ctx.lineTo(w - padRight, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- X axis (Price) ---
    ctx.strokeStyle = "rgba(60, 74, 66, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + chartH);
    ctx.lineTo(w - padRight, padTop + chartH);
    ctx.stroke();

    // X-axis ticks & labels
    const xTicks = 5;
    ctx.textAlign = "center";
    ctx.fillStyle = "#7a8a80";
    ctx.font = "9px 'Space Grotesk', sans-serif";
    for (let i = 0; i <= xTicks; i++) {
      const price = pMin + (i / xTicks) * (pMax - pMin);
      const x = toX(price);
      // Tick mark
      ctx.strokeStyle = "rgba(60, 74, 66, 0.3)";
      ctx.beginPath();
      ctx.moveTo(x, padTop + chartH);
      ctx.lineTo(x, padTop + chartH + 4);
      ctx.stroke();
      // Label
      ctx.fillStyle = "#7a8a80";
      ctx.fillText(`$${price.toFixed(0)}`, x, padTop + chartH + 16);
    }

    // Axis labels
    ctx.fillStyle = "rgba(186, 202, 192, 0.4)";
    ctx.font = "8px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Stock Price at Expiry", padLeft + chartW / 2, padTop + chartH + 32);
    ctx.save();
    ctx.translate(12, padTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("P&L", 0, 0);
    ctx.restore();

    // --- Loss zone fill ---
    ctx.fillStyle = "rgba(255, 107, 107, 0.04)";
    ctx.beginPath();
    ctx.moveTo(toX(beDown), zeroY);
    ctx.lineTo(toX(strike), maxLossY);
    ctx.lineTo(toX(beUp), zeroY);
    ctx.closePath();
    ctx.fill();

    // --- P&L curve ---
    ctx.strokeStyle = "#4ef2b4";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const price = pMin + (i / steps) * (pMax - pMin);
      const x = toX(price);
      const y = toY(stradplePL(price));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // --- Breakeven dots ---
    ctx.fillStyle = "#4ef2b4";
    [beDown, beUp].forEach((be) => {
      ctx.beginPath();
      ctx.arc(toX(be), zeroY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Breakeven labels — push apart if too close
    ctx.font = "bold 9px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#4ef2b4";
    const beDownX = toX(beDown);
    const beUpX = toX(beUp);
    const labelGap = beUpX - beDownX;
    if (labelGap < 50) {
      // Labels would overlap — offset left/right
      ctx.textAlign = "right";
      ctx.fillText(`$${beDown.toFixed(0)}`, beDownX - 6, zeroY + 3);
      ctx.textAlign = "left";
      ctx.fillText(`$${beUp.toFixed(0)}`, beUpX + 6, zeroY + 3);
    } else {
      ctx.textAlign = "center";
      ctx.fillText(`$${beDown.toFixed(0)}`, beDownX, zeroY - 10);
      ctx.fillText(`$${beUp.toFixed(0)}`, beUpX, zeroY - 10);
    }
  }, [strike, totalDebit, contracts]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
        <span className="font-headline font-semibold text-sm text-on-surface">
          {symbol}x Straddle
        </span>
        <span className="text-[10px] font-label text-on-surface-variant">
          {contracts}x · Max loss <span className="text-error font-bold">${(totalDebit * contracts * 100).toFixed(0)}</span>
        </span>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0">
        {strike > 0 ? (
          <canvas ref={canvasRef} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm font-label text-on-surface-variant">
            Waiting for price data...
          </div>
        )}
      </div>
    </div>
  );
}
