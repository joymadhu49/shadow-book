"use client";

import { usePrice } from "@/lib/use-price";
import { PAIR } from "@/lib/constants";

export function PairStats() {
  const p = usePrice();
  const range = p?.high24h && p?.low24h && p?.usd
    ? Math.min(100, Math.max(0, ((p.usd - p.low24h) / (p.high24h - p.low24h)) * 100))
    : 50;

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px] tracking-wide">Market</h3>
          <span className="font-mono text-[11px] text-[var(--mb-text-muted)]">{PAIR.base.symbol}/{PAIR.quote.symbol}</span>
        </div>
        <span className="text-[10px] text-[var(--mb-text-muted)] uppercase tracking-wider font-semibold font-mono">
          {p?.source ?? "—"}
        </span>
      </div>

      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--mb-border)] rounded-lg overflow-hidden border border-[var(--mb-border)]">
        <Cell label="Last" value={p ? `$${p.usd.toFixed(2)}` : "—"} sub={p ? `${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(2)}%` : ""} subColor={p && p.change24h >= 0 ? "success" : "danger"} />
        <Cell label="24h High" value={p?.high24h ? `$${p.high24h.toFixed(2)}` : "—"} sub="USD" />
        <Cell label="24h Low" value={p?.low24h ? `$${p.low24h.toFixed(2)}` : "—"} sub="USD" />
        <Cell label="24h Vol" value={p?.vol24h ? fmtUsd(p.vol24h) : "—"} sub="USD" />
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold mb-2 mt-1">
          <span>24h Range</span>
          <span className="font-mono normal-case tracking-normal text-[var(--mb-text-secondary)]">
            {p?.low24h?.toFixed(2)} → {p?.high24h?.toFixed(2)}
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-[var(--mb-bg-primary)] border border-[var(--mb-border)]">
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#4DA8FF]"
            style={{ width: `${range}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--mb-text-primary)] shadow-[0_0_8px_rgba(0,217,255,0.6)]"
            style={{ left: `${range}%` }}
          />
        </div>
      </div>

      <div className="px-5 pb-5 grid grid-cols-2 gap-3 text-[11px] border-t border-[var(--mb-border)] pt-4">
        <Stat label="Market Cap" value={p?.marketCap ? fmtUsd(p.marketCap) : "—"} />
        <Stat label="ATH" value={p?.ath ? `$${p.ath.toFixed(2)}` : "—"} sub={p?.athChange ? `${p.athChange.toFixed(1)}% from ATH` : ""} />
      </div>
    </div>
  );
}

function Cell({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor?: "success" | "danger" }) {
  const cls = subColor === "success" ? "text-[var(--mb-success)]" : subColor === "danger" ? "text-[var(--mb-danger)]" : "text-[var(--mb-text-muted)]";
  return (
    <div className="bg-[var(--mb-bg-secondary)] px-3 py-3 flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
      <span className="font-mono tabular-nums text-[14px] font-medium text-[var(--mb-text-primary)] leading-none">{value}</span>
      <span className={`text-[10px] font-mono tabular-nums ${cls}`}>{sub || " "}</span>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
      <span className="font-mono tabular-nums text-[13px] text-[var(--mb-text-primary)]">{value}</span>
      {sub && <span className="text-[10px] font-mono text-[var(--mb-text-muted)]">{sub}</span>}
    </div>
  );
}

function fmtUsd(n: number) {
  if (n === 0) return "$0";
  if (n < 1000) return `$${n.toFixed(2)}`;
  if (n < 1_000_000) return `$${(n / 1000).toFixed(1)}K`;
  if (n < 1_000_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000_000_000).toFixed(2)}B`;
}
