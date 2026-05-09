"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTee } from "@/lib/tee-context";

export function TeeButton() {
  const { connected } = useWallet();
  const { session, status, error, authenticate, signOut } = useTee();
  const [open, setOpen] = useState(false);

  // close popover on outside click
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-tee-pop]")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // Auto-prompt once when wallet connects but no session
  const [autoPromptDone, setAutoPromptDone] = useState(false);
  useEffect(() => {
    if (connected && !session && status === "idle" && !autoPromptDone) {
      setAutoPromptDone(true);
    }
  }, [connected, session, status, autoPromptDone]);

  if (!connected) return null;

  const minsLeft = session ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 60_000)) : 0;
  const ready = status === "ready" && session;
  const busy = status === "verifying" || status === "signing";

  return (
    <div className="relative" data-tee-pop>
      <button
        onClick={() => ready ? setOpen((o) => !o) : authenticate()}
        disabled={busy}
        className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-[12px] font-semibold transition-all ${
          ready
            ? "border-[var(--mb-success)]/40 bg-[rgba(0,230,118,0.08)] text-[var(--mb-success)] hover:bg-[rgba(0,230,118,0.12)]"
            : busy
            ? "border-[var(--mb-warning)]/40 bg-[rgba(255,181,71,0.08)] text-[var(--mb-warning)]"
            : "border-[var(--mb-accent)]/40 bg-[rgba(0,217,255,0.08)] text-[var(--mb-accent)] hover:bg-[rgba(0,217,255,0.14)]"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${
          ready ? "bg-[var(--mb-success)] shadow-[0_0_6px_var(--mb-success)]"
          : busy ? "bg-[var(--mb-warning)] animate-pulse"
          : "bg-[var(--mb-accent)] animate-[mb-pulse-soft_2s_ease-in-out_infinite]"
        }`} />
        <span className="hidden sm:inline">
          {ready ? `TEE · ${minsLeft}m` : busy ? (status === "signing" ? "Signing…" : "Verifying…") : "Authenticate TEE"}
        </span>
        <span className="sm:hidden">TEE</span>
      </button>

      {open && ready && (
        <div className="absolute right-0 top-full mt-2 w-[280px] mb-card-elevated p-4 z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[12px] font-semibold tracking-wide">TEE Session</h4>
            <span className="text-[10px] uppercase tracking-wider text-[var(--mb-success)] font-semibold">Active</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <Row label="Endpoint" value="devnet-tee" />
            <Row label="TDX quote" value="✓ verified" valueClass="text-[var(--mb-success)]" />
            <Row label="Token" value={session.token.slice(0, 8) + "…"} mono />
            <Row label="Expires in" value={`${minsLeft}m`} mono />
          </div>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full mt-4 h-8 rounded-md border border-[var(--mb-border)] hover:border-[var(--mb-danger)] hover:text-[var(--mb-danger)] text-[12px] text-[var(--mb-text-secondary)] transition-colors"
          >
            Sign out of TEE
          </button>
        </div>
      )}

      {error && status === "error" && (
        <div className="absolute right-0 top-full mt-2 w-[280px] p-3 rounded-lg border border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.08)] text-[var(--mb-danger)] text-[11px] z-50 shadow-2xl break-words">
          {error}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono, valueClass }: { label: string; value: string; mono?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--mb-text-muted)] uppercase tracking-wider text-[9px] font-semibold">{label}</span>
      <span className={`text-[var(--mb-text-secondary)] tabular-nums ${mono ? "font-mono" : ""} ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
