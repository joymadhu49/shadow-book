"use client";
import { useEffect, useState } from "react";

export type PricePoint = { usd: number; change24h: number; vol24h: number; source: string; ts: number };

export function usePrice(intervalMs = 10_000): PricePoint | null {
  const [p, setP] = useState<PricePoint | null>(null);
  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const r = await fetch("/api/market/price");
        if (!r.ok) return;
        const j = await r.json();
        if (alive && j.usd) setP(j);
      } catch {}
    }
    tick();
    const id = setInterval(tick, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [intervalMs]);
  return p;
}
