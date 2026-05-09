"use client";

import { usePrice } from "@/lib/use-price";
import { PAIR } from "@/lib/constants";

export function PairStrip() {
  const p = usePrice();
  const up = (p?.change24h ?? 0) >= 0;

  return (
    <div className="border-b border-[var(--mb-border)] bg-[rgba(10,14,26,0.5)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-[14px] tracking-tight">{PAIR.base.symbol}</span>
          <span className="text-[var(--mb-text-muted)] text-[14px]">/</span>
          <span className="font-semibold text-[14px] tracking-tight">{PAIR.quote.symbol}</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(0,217,255,0.1)] text-[var(--mb-accent)] border border-[rgba(0,217,255,0.25)]">Hidden · TEE</span>
        </div>

        <Cell label="Last" value={p ? `$${p.usd.toFixed(2)}` : "—"} valueColor={p && up ? "var(--mb-success)" : p ? "var(--mb-danger)" : undefined} />
        <Cell label="24h Change" value={p ? `${up ? "+" : ""}${p.change24h.toFixed(2)}%` : "—"} valueColor={p && up ? "var(--mb-success)" : p ? "var(--mb-danger)" : undefined} />
        <Cell label="24h High" value={p?.high24h ? `$${p.high24h.toFixed(2)}` : "—"} />
        <Cell label="24h Low" value={p?.low24h ? `$${p.low24h.toFixed(2)}` : "—"} />
        <Cell label="24h Vol" value={p?.vol24h ? fmtUsd(p.vol24h) : "—"} />

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">Latency</span>
          <span className="font-mono tabular-nums text-[12px] text-[var(--mb-success)]">&lt;50ms</span>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
      <span className="font-mono tabular-nums text-[12px] font-medium" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}

function fmtUsd(n: number) {
  if (n < 1_000_000) return `$${(n / 1000).toFixed(1)}K`;
  if (n < 1_000_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000_000_000).toFixed(2)}B`;
}
