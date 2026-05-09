"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PAIR } from "@/lib/constants";
import { usePrice } from "@/lib/use-price";

type Side = "buy" | "sell";

export function OrderEntry() {
  const { connected, publicKey } = useWallet();
  const price = usePrice();
  const [side, setSide] = useState<Side>("buy");
  const [priceInput, setPriceInput] = useState("");
  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (price && !priceInput) setPriceInput(price.usd.toFixed(2));
  }, [price, priceInput]);

  const total = priceInput && size ? (parseFloat(priceInput) * parseFloat(size)) : 0;
  const spreadFromMid = price && priceInput ? ((parseFloat(priceInput) - price.usd) / price.usd) * 100 : 0;

  async function submit() {
    if (!connected) return setMsg("Connect wallet first.");
    if (!priceInput || !size) return setMsg("Price and size required.");
    setSubmitting(true); setMsg(null);
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
      setMsg(`Order submitted to TEE.`);
      setSize("");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--mb-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px] tracking-wide">Place Order</h3>
        </div>
        <span className="font-mono text-[11px] text-[var(--mb-text-muted)]">{PAIR.base.symbol}/{PAIR.quote.symbol}</span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--mb-bg-primary)] rounded-lg border border-[var(--mb-border)]">
          <button
            onClick={() => setSide("buy")}
            className={`h-8 rounded-md text-[12px] font-semibold transition-all ${side === "buy" ? "bg-[var(--mb-success)] text-[#0A0E1A] shadow-[0_2px_8px_rgba(0,230,118,0.25)]" : "text-[var(--mb-text-secondary)] hover:text-[var(--mb-success)]"}`}
          >Buy</button>
          <button
            onClick={() => setSide("sell")}
            className={`h-8 rounded-md text-[12px] font-semibold transition-all ${side === "sell" ? "bg-[var(--mb-danger)] text-[#0A0E1A] shadow-[0_2px_8px_rgba(255,77,109,0.25)]" : "text-[var(--mb-text-secondary)] hover:text-[var(--mb-danger)]"}`}
          >Sell</button>
        </div>

        <div className="mt-4 space-y-3">
          <Field
            label={`Limit Price`}
            unit={PAIR.quote.symbol}
            value={priceInput}
            onChange={setPriceInput}
            hint={price ? `oracle ${price.usd.toFixed(2)} · ${spreadFromMid >= 0 ? "+" : ""}${spreadFromMid.toFixed(2)}%` : ""}
          />
          <Field
            label={`Order Size`}
            unit={PAIR.base.symbol}
            value={size}
            onChange={setSize}
          />
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--mb-border)] space-y-1.5">
          <Row label="Total" value={`${total.toFixed(2)} ${PAIR.quote.symbol}`} />
          <Row label="Network fee" value="~0.000005 SOL" muted />
          <Row label="TEE settlement" value="atomic · sub-50ms" muted />
        </div>

        <button
          onClick={submit}
          disabled={!connected || submitting}
          className="mb-btn-primary w-full mt-4 h-10 text-[13px]"
        >
          {submitting ? "Submitting…" : !connected ? "Connect Wallet" : `Place ${side === "buy" ? "Buy" : "Sell"} Order`}
        </button>

        {msg && (
          <div className={`mt-3 text-[11px] px-3 py-2 rounded-md border ${msg.startsWith("Order") ? "border-[rgba(0,230,118,0.3)] bg-[rgba(0,230,118,0.08)] text-[var(--mb-success)]" : "border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.08)] text-[var(--mb-danger)]"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, unit, value, onChange, hint }: { label: string; unit: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
        {hint && <span className="text-[10px] font-mono text-[var(--mb-text-muted)]">{hint}</span>}
      </div>
      <div className="mt-1.5 relative">
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
