"use client";

import { useEffect, useState } from "react";

type Net = {
  cluster: string;
  slot: number;
  blockHeight: number;
  version: string | null;
  rttMs: number;
  tee: { ok: boolean; validator: string };
  ts: number;
};

export function NetworkStatus() {
  const [n, setN] = useState<Net | null>(null);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const r = await fetch("/api/market/network");
        if (!r.ok) return;
        const j = await r.json();
        if (alive && j.slot) setN(j);
      } catch {}
    }
    tick();
    const id = setInterval(tick, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <h3 className="font-semibold text-[13px] tracking-wide">Network</h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--mb-text-secondary)] flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${n ? "bg-[var(--mb-success)] shadow-[0_0_6px_var(--mb-success)]" : "bg-[var(--mb-text-muted)]"}`} />
          {n ? "live" : "—"}
        </span>
      </div>

      <div className="p-5 grid grid-cols-2 gap-4 text-[11px]">
        <Stat label="Cluster" value={n?.cluster ?? "—"} />
        <Stat label="Solana core" value={n?.version ?? "—"} />
        <Stat label="Slot" value={n?.slot ? n.slot.toLocaleString() : "—"} />
        <Stat label="Block height" value={n?.blockHeight ? n.blockHeight.toLocaleString() : "—"} />
        <Stat label="RPC RTT" value={n ? `${n.rttMs}ms` : "—"} valueColor={n && n.rttMs < 300 ? "var(--mb-success)" : n && n.rttMs < 800 ? "var(--mb-warning)" : "var(--mb-danger)"} />
        <Stat label="TEE health" value={n?.tee.ok ? "online" : n ? "down" : "—"} valueColor={n?.tee.ok ? "var(--mb-success)" : n ? "var(--mb-danger)" : undefined} />
      </div>

      <div className="px-5 pb-5 border-t border-[var(--mb-border)] pt-4 grid grid-cols-1 gap-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[9px] font-semibold">TEE Validator</span>
          <span className="font-mono tabular-nums text-[var(--mb-text-primary)]">{n?.tee.validator ?? "MTEW…3xzo"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[9px] font-semibold">Permission Program</span>
          <span className="font-mono tabular-nums text-[var(--mb-text-primary)]">ACLs…XQnp1</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[9px] font-semibold">Delegation Program</span>
          <span className="font-mono tabular-nums text-[var(--mb-text-primary)]">DELe…SaeSh</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
      <span className="font-mono tabular-nums text-[var(--mb-text-primary)]" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}
