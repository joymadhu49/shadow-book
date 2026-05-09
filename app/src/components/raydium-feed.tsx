"use client";

import { useEffect, useState } from "react";

type Trade = { signature: string; ts: number; slot: number };

export function RaydiumFeed({ limit = 12 }: { limit?: number }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pool, setPool] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const r = await fetch("/api/market/raydium");
        if (!r.ok) return;
        const j = await r.json();
        if (alive) {
          setPool(j.pool);
          setTrades((j.trades ?? []).slice(0, limit));
        }
      } catch {}
    }
    tick();
    const id = setInterval(tick, 6000);
    return () => { alive = false; clearInterval(id); };
  }, [limit]);

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px] tracking-wide">Reference: Raydium SOL/USDC</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(255,181,71,0.1)] text-[var(--mb-warning)] border border-[rgba(255,181,71,0.3)]">Mainnet · Public AMM</span>
        </div>
        {pool && (
          <a href={`https://solscan.io/account/${pool}`} target="_blank" className="text-[10px] text-[var(--mb-text-muted)] hover:text-[var(--mb-accent)] font-mono">
            {pool.slice(0, 6)}…{pool.slice(-4)}
          </a>
        )}
      </div>

      <div className="px-5 py-3 border-b border-[var(--mb-border)] text-[11px] text-[var(--mb-text-muted)] leading-relaxed">
        What every other DEX leaks: every swap is signature-public + size-public + timing-public. The whole reason Shadow Book exists.
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12 px-6 text-[12px] text-[var(--mb-text-muted)]">Loading mainnet pool activity…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[10px] font-semibold border-b border-[var(--mb-border)]">
                <th className="text-left px-4 py-2.5">Slot</th>
                <th className="text-left px-4 py-2.5">Block time</th>
                <th className="text-left px-4 py-2.5">Signature</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.signature} className="border-b border-[var(--mb-border)] last:border-0 hover:bg-[var(--mb-bg-elevated)] transition-colors">
                  <td className="px-4 py-2.5 font-mono tabular-nums text-[var(--mb-text-secondary)]">{t.slot.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-[var(--mb-text-muted)]">{relTime(t.ts)}</td>
                  <td className="px-4 py-2.5">
                    <a
                      href={`https://solscan.io/tx/${t.signature}`}
                      target="_blank"
                      className="font-mono text-[var(--mb-accent)] hover:underline"
                    >
                      {t.signature.slice(0, 12)}…{t.signature.slice(-6)}
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
