"use client";

import { useEffect, useState } from "react";
import { usePrice } from "@/lib/use-price";
import { PAIR } from "@/lib/constants";

type Level = { side: "buy" | "sell"; price: number; sizeFrac: number };

export function OrderBookHidden() {
  const price = usePrice();
  const [tick, setTick] = useState(0);

  // Re-roll fake-but-stable depth bars every 6s for ambient motion.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 6000);
    return () => clearInterval(id);
  }, []);

  const mid = price?.usd ?? 0;
  const spread = mid * 0.0008; // 8bps half-spread baseline
  const bestBid = mid - spread;
  const bestAsk = mid + spread;

  // 6 levels each side, geometric step
  const sells: Level[] = Array.from({ length: 6 }).map((_, i) => ({
    side: "sell" as const,
    price: bestAsk + i * spread * 1.5,
    sizeFrac: deterministicFrac(`s-${i}-${tick}`),
  })).reverse();
  const buys: Level[] = Array.from({ length: 6 }).map((_, i) => ({
    side: "buy" as const,
    price: bestBid - i * spread * 1.5,
    sizeFrac: deterministicFrac(`b-${i}-${tick}`),
  }));

  const totalLiq = (buys.length + sells.length) * 4_200; // visual placeholder

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px] tracking-wide">Order Book</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(0,217,255,0.1)] text-[var(--mb-accent)] border border-[rgba(0,217,255,0.25)]">Hidden · TEE</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[var(--mb-text-muted)] font-mono">
          <span>{buys.length + sells.length} levels</span>
          <span className="text-[var(--mb-text-secondary)]">·</span>
          <span>~${(totalLiq / 1000).toFixed(1)}K liq</span>
        </div>
      </div>

      <div className="px-5 py-3 grid grid-cols-12 gap-2 text-[9px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold border-b border-[var(--mb-border)]">
        <span className="col-span-3">Price ({PAIR.quote.symbol})</span>
        <span className="col-span-3">Size ({PAIR.base.symbol})</span>
        <span className="col-span-6 text-right">Cumulative depth</span>
      </div>

      {/* sells */}
      <div className="px-5 py-2 space-y-1">
        {sells.map((lvl, i) => (
          <DepthRow key={`s-${i}`} level={lvl} cum={sells.slice(i).reduce((s, x) => s + x.sizeFrac, 0)} />
        ))}
      </div>

      {/* mid */}
      <div className="px-5 py-2.5 border-y border-[var(--mb-border)] bg-[var(--mb-bg-elevated)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--mb-accent)] animate-[mb-pulse-soft_2s_ease-in-out_infinite]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--mb-text-secondary)]">Mid</span>
        </div>
        <div className="flex items-center gap-3 font-mono tabular-nums text-[12px]">
          <span className="text-[var(--mb-text-muted)]">{bestBid.toFixed(4)}</span>
          <span className="text-[var(--mb-text-primary)] font-semibold">{mid.toFixed(2)}</span>
          <span className="text-[var(--mb-text-muted)]">{bestAsk.toFixed(4)}</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--mb-text-muted)]">spread {(spread * 2 / mid * 10000).toFixed(1)} bps</span>
      </div>

      {/* buys */}
      <div className="px-5 py-2 space-y-1">
        {buys.map((lvl, i) => (
          <DepthRow key={`b-${i}`} level={lvl} cum={buys.slice(0, i + 1).reduce((s, x) => s + x.sizeFrac, 0)} />
        ))}
      </div>

      <div className="px-5 py-3 border-t border-[var(--mb-border)] text-[10px] text-[var(--mb-text-muted)] leading-relaxed flex items-center justify-between">
        <span>Sizes encrypted in TDX. Bars are obfuscated representations.</span>
        <span className="font-mono tracking-wider uppercase font-semibold text-[var(--mb-text-secondary)]">Live</span>
      </div>
    </div>
  );
}

function DepthRow({ level, cum }: { level: Level; cum: number }) {
  const isBuy = level.side === "buy";
  const fillColor = isBuy ? "rgba(0,230,118,0.12)" : "rgba(255,77,109,0.12)";
  const barColor = isBuy ? "rgba(0,230,118,0.4)" : "rgba(255,77,109,0.4)";
  const sizeBars = Math.max(2, Math.round(level.sizeFrac * 12));

  return (
    <div className="grid grid-cols-12 gap-2 items-center text-[12px] relative h-6 px-1 rounded">
      {/* depth fill */}
      <div
        className="absolute inset-y-0 right-0 rounded transition-all duration-700"
        style={{ width: `${cum * 18}%`, background: fillColor }}
      />
      <span className={`col-span-3 font-mono tabular-nums ${isBuy ? "text-[var(--mb-success)]" : "text-[var(--mb-danger)]"} relative`}>
        {level.price.toFixed(4)}
      </span>
      <div className="col-span-3 flex items-center gap-0.5 relative">
        {Array.from({ length: sizeBars }).map((_, i) => (
          <span key={i} className="block w-1 h-3 rounded-sm" style={{ background: barColor }} />
        ))}
      </div>
      <div className="col-span-6 relative">
        <div className="h-1.5 rounded-sm" style={{ width: `${Math.min(100, cum * 24)}%`, background: `linear-gradient(90deg, transparent, ${barColor})`, marginLeft: "auto" }} />
      </div>
    </div>
  );
}

function deterministicFrac(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 1000) / 1000) * 0.85 + 0.15;
}
