"use client";

import { useEffect, useState } from "react";

type Trade = { signature: string; ts: number; slot: number };

export function LeakComparison() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const r = await fetch("/api/market/raydium");
        if (!r.ok) return;
        const j = await r.json();
        if (alive) setTrades((j.trades ?? []).slice(0, 6));
      } catch {}
    }
    tick();
    const id = setInterval(tick, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <h3 className="font-semibold text-[13px] tracking-wide">What leaks · what doesn&apos;t</h3>
        <span className="text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">live · last 6</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[var(--mb-border)]">
        {/* PUBLIC SIDE */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mb-danger)]" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--mb-danger)]">Raydium · public</span>
          </div>
          {trades.length === 0 ? (
            <FeedSkeleton />
          ) : (
            <ul className="space-y-1.5">
              {trades.map((t) => (
                <li key={t.signature} className="text-[11px] flex items-center justify-between font-mono tabular-nums">
                  <a
                    href={`https://solscan.io/tx/${t.signature}`}
                    target="_blank"
                    className="text-[var(--mb-accent)] hover:underline truncate"
                  >
                    {t.signature.slice(0, 8)}…
                  </a>
                  <span className="text-[var(--mb-text-muted)] text-[10px] ml-2">{relTime(t.ts)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[10px] text-[var(--mb-text-muted)] leading-relaxed">
            Sig + size + side + maker + timing — every datapoint indexed forever.
          </p>
        </div>

        {/* PRIVATE SIDE */}
        <div className="p-4 bg-[rgba(0,217,255,0.02)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mb-success)] shadow-[0_0_6px_var(--mb-success)]" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--mb-success)]">Shadow Book · TEE</span>
          </div>
          <ul className="space-y-1.5">
            {trades.slice(0, 6).map((_, i) => (
              <li key={i} className="text-[11px] flex items-center justify-between font-mono tabular-nums">
                <span className="text-[var(--mb-text-muted)] select-none">█████████…</span>
                <span className="text-[var(--mb-text-muted)] text-[10px]">encrypted</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] text-[var(--mb-text-muted)] leading-relaxed">
            Encrypted at rest in TDX. Only the engine + owner read price/size.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <ul className="space-y-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-3 rounded bg-[var(--mb-bg-elevated)] animate-pulse" />
      ))}
    </ul>
  );
}

function relTime(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  return `${Math.floor(sec / 3600)}h`;
}
