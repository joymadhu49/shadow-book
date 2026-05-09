"use client";

import { useEffect, useState } from "react";
import { PAIR } from "@/lib/constants";

type Fill = {
  id: string;
  price: number;
  size: number;
  ts: number;
  signature: string;
};

export function FillsFeed({ limit = 10 }: { limit?: number }) {
  const [fills, setFills] = useState<Fill[]>([]);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res = await fetch("/api/fills");
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setFills((data.fills ?? []).slice(0, limit));
      } catch {}
    }
    tick();
    const id = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(id); };
  }, [limit]);

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px] tracking-wide">Settled Fills</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--mb-bg-elevated)] text-[var(--mb-text-secondary)] border border-[var(--mb-border)]">Public · Onchain</span>
        </div>
        <span className="text-[11px] text-[var(--mb-text-muted)] font-mono tabular-nums">{fills.length} recent</span>
      </div>

      {fills.length === 0 ? (
        <div className="text-center py-12 px-6 text-[12px] text-[var(--mb-text-muted)]">
          No fills yet. Settled trades will appear here — same as any Solana swap.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[10px] font-semibold border-b border-[var(--mb-border)]">
                <th className="text-left px-4 py-2.5 font-semibold">Time</th>
                <th className="text-left px-4 py-2.5 font-semibold">Price</th>
                <th className="text-left px-4 py-2.5 font-semibold">Size</th>
                <th className="text-left px-4 py-2.5 font-semibold">Total</th>
                <th className="text-left px-4 py-2.5 font-semibold">Signature</th>
              </tr>
            </thead>
            <tbody>
              {fills.map((f) => (
                <tr key={f.id} className="border-b border-[var(--mb-border)] last:border-0 hover:bg-[var(--mb-bg-elevated)] transition-colors">
                  <td className="px-4 py-2.5 text-[var(--mb-text-muted)] font-mono tabular-nums">{relTime(f.ts)}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-[var(--mb-text-primary)]">{f.price.toFixed(4)}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{f.size.toFixed(4)} <span className="text-[var(--mb-text-muted)]">{PAIR.base.symbol}</span></td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{(f.price * f.size).toFixed(2)} <span className="text-[var(--mb-text-muted)]">{PAIR.quote.symbol}</span></td>
                  <td className="px-4 py-2.5">
                    <a
                      href={`https://solscan.io/tx/${f.signature}?cluster=devnet`}
                      target="_blank"
                      className="font-mono text-[var(--mb-accent)] hover:underline tabular-nums"
                    >
                      {f.signature.slice(0, 8)}…
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function relTime(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}
