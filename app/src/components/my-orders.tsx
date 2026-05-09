"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PAIR } from "@/lib/constants";

type Order = {
  id: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  filled: number;
  status: "open" | "filled" | "cancelled" | "matching";
  ts: number;
};

export function MyOrders({ compact = false }: { compact?: boolean }) {
  const { publicKey } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!publicKey) { setOrders([]); return; }
    let alive = true;
    async function tick() {
      try {
        const res = await fetch(`/api/orders?owner=${publicKey!.toBase58()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setOrders(data.orders ?? []);
      } catch {}
    }
    tick();
    const id = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(id); };
  }, [publicKey]);

  async function cancel(id: string) {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
  }

  const open = orders.filter((o) => o.status === "open" || o.status === "matching");
  const display = compact ? open : orders;

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px] tracking-wide">My Orders</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(0,217,255,0.1)] text-[var(--mb-accent)] border border-[rgba(0,217,255,0.25)]">Private · TEE</span>
        </div>
        <span className="text-[11px] text-[var(--mb-text-muted)] font-mono tabular-nums">{open.length} open</span>
      </div>

      {display.length === 0 ? (
        <Empty msg={publicKey ? "No orders yet. Place one to seed the book." : "Connect wallet to view orders."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[10px] font-semibold border-b border-[var(--mb-border)]">
                <Th>Side</Th><Th>Price</Th><Th>Size</Th><Th>Filled</Th><Th>Status</Th><Th>Age</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {display.map((o) => (
                <tr key={o.id} className="border-b border-[var(--mb-border)] last:border-0 hover:bg-[var(--mb-bg-elevated)] transition-colors">
                  <Td>
                    <span className={`font-semibold ${o.side === "buy" ? "text-[var(--mb-success)]" : "text-[var(--mb-danger)]"}`}>
                      {o.side === "buy" ? "BUY" : "SELL"}
                    </span>
                  </Td>
                  <Td mono>{o.price.toFixed(4)}</Td>
                  <Td mono>{o.size.toFixed(4)} <span className="text-[var(--mb-text-muted)]">{PAIR.base.symbol}</span></Td>
                  <Td mono>{((o.filled / o.size) * 100).toFixed(0)}%</Td>
                  <Td><StatusPill status={o.status} /></Td>
                  <Td mono className="text-[var(--mb-text-muted)]">{relTime(o.ts)}</Td>
                  <Td>
                    {o.status === "open" && (
                      <button
                        onClick={() => cancel(o.id)}
                        className="text-[10px] uppercase tracking-wider font-semibold text-[var(--mb-text-muted)] hover:text-[var(--mb-danger)] transition-colors"
                      >Cancel</button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => <th className="text-left px-4 py-2.5 font-semibold">{children}</th>;
const Td = ({ children, mono, className }: { children?: React.ReactNode; mono?: boolean; className?: string }) => (
  <td className={`px-4 py-2.5 ${mono ? "font-mono tabular-nums" : ""} ${className ?? ""}`}>{children}</td>
);

function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    open: "bg-[rgba(0,217,255,0.1)] text-[var(--mb-accent)] border-[rgba(0,217,255,0.3)]",
    filled: "bg-[rgba(0,230,118,0.1)] text-[var(--mb-success)] border-[rgba(0,230,118,0.3)]",
    cancelled: "bg-[var(--mb-bg-elevated)] text-[var(--mb-text-muted)] border-[var(--mb-border)]",
    matching: "bg-[rgba(255,181,71,0.1)] text-[var(--mb-warning)] border-[rgba(255,181,71,0.3)] animate-pulse",
  };
  return <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${map[status]}`}>{status}</span>;
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="text-center py-12 px-6 text-[12px] text-[var(--mb-text-muted)]">
      {msg}
    </div>
  );
}

function relTime(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  return `${Math.floor(sec / 3600)}h`;
}
