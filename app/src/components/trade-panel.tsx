"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PAIR } from "@/lib/constants";
import { usePrice } from "@/lib/use-price";
import { useTee } from "@/lib/tee-context";

type Side = "buy" | "sell";

export function TradePanel() {
  const { connected, publicKey } = useWallet();
  const price = usePrice();
  const tee = useTee();

  const [side, setSide] = useState<Side>("buy");
  const [priceInput, setPriceInput] = useState("");
  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderMsg, setOrderMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (price && !priceInput) setPriceInput(price.usd.toFixed(2));
  }, [price, priceInput]);

  async function submit() {
    if (!connected) return setOrderMsg({ ok: false, text: "Connect wallet first." });
    if (tee.status !== "ready") return setOrderMsg({ ok: false, text: "Authenticate TEE in header first." });
    if (!priceInput || !size) return setOrderMsg({ ok: false, text: "Price and size required." });
    setSubmitting(true); setOrderMsg(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side,
          price: parseFloat(priceInput),
          size: parseFloat(size),
          owner: publicKey?.toBase58(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOrderMsg({ ok: true, text: "Order submitted to TEE." });
      setSize("");
    } catch (e) {
      setOrderMsg({ ok: false, text: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  const total = priceInput && size ? parseFloat(priceInput) * parseFloat(size) : 0;
  const spread = price && priceInput ? ((parseFloat(priceInput) - price.usd) / price.usd) * 100 : 0;
  const teeReady = tee.status === "ready";
  const ctaLabel = !connected
    ? "Connect Wallet"
    : !teeReady
    ? "Authenticate TEE"
    : `Place ${side === "buy" ? "Buy" : "Sell"} Order`;

  return (
    <div className="mb-card overflow-hidden">
      {/* Pair header */}
      <div className="px-5 py-4 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[15px] tracking-tight">{PAIR.base.symbol}</span>
            <span className="text-[var(--mb-text-muted)] text-[15px]">/</span>
            <span className="font-semibold text-[15px] tracking-tight">{PAIR.quote.symbol}</span>
          </div>
          {price && (
            <span className="font-mono tabular-nums text-[12px] text-[var(--mb-text-secondary)]">
              ${price.usd.toFixed(2)}
              <span className={`ml-1.5 ${price.change24h >= 0 ? "text-[var(--mb-success)]" : "text-[var(--mb-danger)]"}`}>
                {price.change24h >= 0 ? "+" : ""}{price.change24h.toFixed(2)}%
              </span>
            </span>
          )}
        </div>
        <SessionDot ready={teeReady} />
      </div>

      {/* Side selector */}
      <div className="p-5 pb-3">
        <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--mb-bg-primary)] rounded-lg border border-[var(--mb-border)]">
          <button
            onClick={() => setSide("buy")}
            className={`h-8 rounded-md text-[12px] font-semibold tracking-tight transition-all ${side === "buy" ? "bg-[var(--mb-success)] text-[#0A0E1A] shadow-[0_2px_8px_rgba(0,230,118,0.25)]" : "text-[var(--mb-text-secondary)] hover:text-[var(--mb-success)]"}`}
          >Buy {PAIR.base.symbol}</button>
          <button
            onClick={() => setSide("sell")}
            className={`h-8 rounded-md text-[12px] font-semibold tracking-tight transition-all ${side === "sell" ? "bg-[var(--mb-danger)] text-[#0A0E1A] shadow-[0_2px_8px_rgba(255,77,109,0.25)]" : "text-[var(--mb-text-secondary)] hover:text-[var(--mb-danger)]"}`}
          >Sell {PAIR.base.symbol}</button>
        </div>
      </div>

      {/* Inputs */}
      <div className="px-5 space-y-2.5">
        <Field
          label="Limit price"
          unit={PAIR.quote.symbol}
          value={priceInput}
          onChange={setPriceInput}
          hint={price ? `oracle ${price.usd.toFixed(2)} · ${spread >= 0 ? "+" : ""}${spread.toFixed(2)}%` : undefined}
        />
        <Field
          label="Order size"
          unit={PAIR.base.symbol}
          value={size}
          onChange={setSize}
        />

        {/* Quick size chips */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {[0.1, 0.5, 1, 5].map((q) => (
            <button
              key={q}
              onClick={() => setSize(q.toString())}
              className="h-7 rounded-md text-[11px] font-mono tabular-nums text-[var(--mb-text-secondary)] border border-[var(--mb-border)] hover:border-[var(--mb-accent)] hover:text-[var(--mb-accent)] transition-colors"
            >
              {q} {PAIR.base.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 mt-4 py-3 border-t border-[var(--mb-border)] space-y-1.5">
        <Row label="Total" value={`${total.toFixed(2)} ${PAIR.quote.symbol}`} />
        <Row label="Network fee" value="~0.000005 SOL" muted />
        <Row label="TEE settlement" value="atomic · sub-50ms" muted />
      </div>

      {/* Submit */}
      <div className="p-5 pt-3 border-t border-[var(--mb-border)]">
        <button
          onClick={() => !connected ? null : !teeReady ? tee.authenticate() : submit()}
          disabled={submitting}
          className={`w-full h-11 text-[13px] font-semibold rounded-lg transition-all ${
            !teeReady
              ? "mb-btn-primary"
              : side === "buy"
              ? "bg-[var(--mb-success)] text-[#0A0E1A] hover:shadow-[0_0_24px_rgba(0,230,118,0.4)] disabled:opacity-40"
              : "bg-[var(--mb-danger)] text-[#0A0E1A] hover:shadow-[0_0_24px_rgba(255,77,109,0.4)] disabled:opacity-40"
          }`}
        >
          {submitting ? "Submitting…" : ctaLabel}
        </button>

        {orderMsg && (
          <div className={`mt-3 text-[11px] px-3 py-2 rounded-md border ${orderMsg.ok ? "border-[rgba(0,230,118,0.3)] bg-[rgba(0,230,118,0.08)] text-[var(--mb-success)]" : "border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.08)] text-[var(--mb-danger)]"}`}>
            {orderMsg.text}
          </div>
        )}

        <p className="mt-3 text-[10px] text-[var(--mb-text-muted)] leading-relaxed">
          Orders encrypted inside Intel TDX enclave. Only the match engine can read price/size. Settles on Solana when filled.
        </p>
      </div>
    </div>
  );
}

function SessionDot({ ready }: { ready: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--mb-text-secondary)]">
      <span className={`w-1.5 h-1.5 rounded-full ${ready ? "bg-[var(--mb-success)] shadow-[0_0_6px_var(--mb-success)]" : "bg-[var(--mb-text-muted)]"}`} />
      <span>{ready ? "TEE active" : "TEE inactive"}</span>
    </div>
  );
}

function Field({ label, unit, value, onChange, hint }: { label: string; unit: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
        {hint && <span className="text-[10px] font-mono text-[var(--mb-text-muted)]">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="mb-input w-full h-10 px-3 pr-14 font-mono text-[14px] tabular-nums"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[var(--mb-text-muted)]">{unit}</span>
      </div>
    </label>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-[var(--mb-text-muted)]">{label}</span>
      <span className={`font-mono tabular-nums ${muted ? "text-[var(--mb-text-muted)]" : "text-[var(--mb-text-primary)] font-medium"}`}>{value}</span>
    </div>
  );
}
