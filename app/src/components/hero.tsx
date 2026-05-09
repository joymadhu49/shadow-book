"use client";

import { useEffect, useState } from "react";
import { usePrice } from "@/lib/use-price";
import { AnimatedBg } from "@/components/animated-bg";

type Stats = { openOrders: number; fills24h: number; volume24h: number };

export function Hero() {
  const price = usePrice();
  const [stats, setStats] = useState<Stats>({ openOrders: 0, fills24h: 0, volume24h: 0 });

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const [o, f] = await Promise.all([fetch("/api/orders"), fetch("/api/fills")]);
        const od = await o.json();
        const fd = await f.json();
        const dayAgo = Date.now() - 86_400_000;
        const open = (od.orders ?? []).filter((x: { status: string }) => x.status === "open").length;
        const recent = (fd.fills ?? []).filter((x: { ts: number }) => x.ts >= dayAgo);
        const vol = recent.reduce((s: number, x: { size: number; price: number }) => s + x.size * x.price, 0);
        if (alive) setStats({ openOrders: open, fills24h: recent.length, volume24h: vol });
      } catch {}
    }
    tick();
    const id = setInterval(tick, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-[var(--mb-border)]">
      <AnimatedBg />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-4xl">
          <span className="mb-reveal mb-reveal-1 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[var(--mb-accent)] font-semibold rounded-full border border-[rgba(0,217,255,0.25)] bg-[rgba(0,217,255,0.05)] px-3 py-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mb-accent)] shadow-[0_0_8px_var(--mb-accent)] animate-[mb-pulse-soft_2s_ease-in-out_infinite]" />
            Private Ephemeral Rollup · Intel TDX
          </span>

          <h1 className="mb-reveal mb-reveal-2 mt-6 text-[44px] md:text-[68px] lg:text-[88px] font-semibold tracking-[-0.035em] leading-[0.95] text-balance">
            The dark pool
            <br />
            that <span className="mb-gradient-text">lives onchain</span>.
          </h1>

          <p className="mb-reveal mb-reveal-3 mt-6 text-[var(--mb-text-secondary)] text-[16px] md:text-[18px] leading-[1.55] max-w-2xl">
            Limit orders encrypted inside a TDX enclave. Matched in TEE. Settled atomically on Solana.
            <br className="hidden md:block" />
            Anti-MEV by construction.
          </p>

          <div className="mb-reveal mb-reveal-4 mt-9 flex flex-wrap items-center gap-3">
            <a href="/trade" className="mb-btn-primary inline-flex items-center gap-2 h-11 px-6 text-[14px]">
              Launch app
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#how" className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-[var(--mb-border)] hover:border-[var(--mb-accent)] text-[14px] font-medium text-[var(--mb-text-secondary)] hover:text-[var(--mb-text-primary)] transition-colors">
              How it works
            </a>
          </div>

          <div className="mb-reveal mb-reveal-5 mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--mb-border)] rounded-xl overflow-hidden border border-[var(--mb-border)] max-w-3xl backdrop-blur-md">
            <Stat label="SOL/USD" value={price ? `$${price.usd.toFixed(2)}` : "—"} sub={price ? `${price.change24h >= 0 ? "+" : ""}${price.change24h.toFixed(2)}% 24h` : "loading"} subColor={price && price.change24h >= 0 ? "success" : "danger"} />
            <Stat label="Open" value={stats.openOrders.toString()} sub="hidden orders" />
            <Stat label="Vol 24h" value={fmtUsd(stats.volume24h)} sub={`${stats.fills24h} fills`} />
            <Stat label="Latency" value="<50ms" sub="TEE settlement" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor?: "success" | "danger" }) {
  const cls = subColor === "success" ? "text-[var(--mb-success)]" : subColor === "danger" ? "text-[var(--mb-danger)]" : "text-[var(--mb-text-muted)]";
  return (
    <div className="bg-[rgba(18,23,42,0.7)] px-5 py-4 flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--mb-text-muted)] font-semibold">{label}</span>
      <span className="font-mono tabular-nums text-[18px] md:text-[20px] font-medium text-[var(--mb-text-primary)] leading-none">{value}</span>
      <span className={`text-[11px] font-mono tabular-nums ${cls}`}>{sub}</span>
    </div>
  );
}

function fmtUsd(n: number) {
  if (n === 0) return "$0";
  if (n < 1000) return `$${n.toFixed(2)}`;
  if (n < 1_000_000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${(n / 1_000_000).toFixed(2)}M`;
}
