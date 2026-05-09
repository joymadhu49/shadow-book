"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useTee } from "@/lib/tee-context";

export function TeeStatus() {
  const { publicKey, connected } = useWallet();
  const { session, status, error, authenticate, signOut } = useTee();
  const ready = status === "ready" && session;
  const busy = status === "verifying" || status === "signing";
  const minsLeft = session ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 60_000)) : 0;

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dot ready={!!ready} busy={busy} err={status === "error"} />
          <h3 className="font-semibold text-[13px] tracking-wide">TEE Session</h3>
        </div>
        <span className="text-[10px] text-[var(--mb-text-muted)] uppercase tracking-wider font-semibold font-mono">devnet-tee</span>
      </div>

      <div className="p-5">
        <div className="space-y-2">
          <Row label="Wallet" value={connected ? truncate(publicKey?.toBase58() ?? "") : "—"} mono />
          <Row label="TDX quote" value={ready ? "✓ verified" : "—"} valueClass={ready ? "text-[var(--mb-success)]" : ""} />
          <Row label="Auth token" value={session ? truncate(session.token, 8) : "—"} mono />
          <Row label="Expires" value={session ? `${minsLeft}m` : "—"} mono />
        </div>

        {ready ? (
          <button
            onClick={signOut}
            className="w-full mt-5 h-10 rounded-lg border border-[var(--mb-border)] hover:border-[var(--mb-danger)] hover:text-[var(--mb-danger)] text-[13px] text-[var(--mb-text-secondary)] transition-colors"
          >
            Sign out of TEE
          </button>
        ) : (
          <button
            onClick={authenticate}
            disabled={!connected || busy}
            className="mb-btn-primary w-full mt-5 h-10 text-[13px]"
          >
            {busy ? (status === "signing" ? "Sign challenge…" : "Verifying TDX…") : !connected ? "Connect wallet first" : "Authenticate w/ TEE"}
          </button>
        )}

        {error && (
          <div className="mt-3 text-[11px] px-3 py-2 rounded-md border border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.08)] text-[var(--mb-danger)] break-words">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ ready, busy, err }: { ready: boolean; busy: boolean; err: boolean }) {
  const c = ready ? "bg-[var(--mb-success)] shadow-[0_0_8px_var(--mb-success)]"
    : err ? "bg-[var(--mb-danger)]"
    : busy ? "bg-[var(--mb-warning)] animate-pulse"
    : "bg-[var(--mb-text-muted)]";
  return <span className={`w-1.5 h-1.5 rounded-full ${c}`} />;
}

function Row({ label, value, mono, valueClass }: { label: string; value: string; mono?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-[var(--mb-text-muted)] uppercase tracking-wider font-semibold text-[10px]">{label}</span>
      <span className={`text-[var(--mb-text-secondary)] tabular-nums ${mono ? "font-mono" : ""} ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}

function truncate(s: string, n = 4) {
  if (!s) return "—";
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}
