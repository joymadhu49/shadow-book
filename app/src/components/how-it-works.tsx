export function HowItWorks() {
  return (
    <section className="mt-20 pt-16 border-t border-[var(--mb-border)]">
      <div className="text-left mb-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--mb-accent)] font-semibold">
          <span className="w-1 h-1 rounded-full bg-[var(--mb-accent)]" />
          Architecture
        </span>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">How a hidden order becomes a public fill.</h2>
        <p className="mt-3 text-[var(--mb-text-secondary)] text-[14px] leading-relaxed">
          Three-stage pipeline. Solana for settlement. TEE for everything else.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Step
          n="01"
          title="Place"
          tag="Solana → PER"
          body="Wallet signs a TDX-attested challenge. Order serialized into a delegated account. Onlookers see a delegate ix — never price or size."
        />
        <Step
          n="02"
          title="Match"
          tag="Inside TEE"
          body="Engine signer (only ENGINE_AUTHORITY) crosses opposing orders by price-time priority. FillEvent emits. Host machine cannot peek."
          accent
        />
        <Step
          n="03"
          title="Settle"
          tag="PER → Solana"
          body="Filled portion commits back to L1 via SPL Token CPI. Public sees a swap. Resting book stays dark."
        />
      </div>

      <Diagram />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Spec label="TEE Validator" value="MTEW…3xzo" />
        <Spec label="Permission Program" value="ACLs…XQnp1" />
        <Spec label="Delegation Program" value="DELe…SaeSh" />
      </div>
    </section>
  );
}

function Step({ n, title, tag, body, accent }: { n: string; title: string; tag: string; body: string; accent?: boolean }) {
  return (
    <div className={`mb-card p-5 transition-all hover:border-[var(--mb-border-strong)] ${accent ? "ring-1 ring-[var(--mb-accent)]/40 shadow-[0_0_28px_rgba(0,217,255,0.12)]" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--mb-text-muted)] tracking-[0.2em] font-semibold">STEP {n}</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--mb-bg-elevated)] text-[var(--mb-text-secondary)] border border-[var(--mb-border)]">{tag}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[13px] text-[var(--mb-text-secondary)] leading-relaxed">{body}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-card p-4 flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider text-[var(--mb-text-muted)] font-semibold">{label}</span>
      <span className="font-mono text-[12px] text-[var(--mb-text-primary)] tabular-nums">{value}</span>
    </div>
  );
}

function Diagram() {
  return (
    <div className="mt-6 mb-card-elevated p-6 overflow-x-auto">
      <pre className="font-mono text-[11px] leading-[1.7] text-[var(--mb-text-secondary)] whitespace-pre">
{`  Trader A                   Solana L1                  PER (Intel TDX)               Trader B
     │                          │                              │                          │
     │── sign TDX challenge ─→  │                              │                          │
     │← bearer token ──────────                                │                          │
     │                          │                              │                          │
     │── place_order(buy 99) ─────────────────────────────────→│ ←── place_order(sell 98) ─┤
     │                          │                              │ [encrypted in vault]      │
     │                          │                              │                          │
     │                          │                       ┌──────┴──────┐                  │
     │                          │                       │ match_tick  │ engine: MTEW…    │
     │                          │                       │ cross @ 98.5│                  │
     │                          │                       └──────┬──────┘                  │
     │                          │                              │                          │
     │                          │ ←── commit fill ─────────────│                          │
     │                          │ ←── settle via SPL ──────────│                          │
     │                          │                              │                          │
     │← fill notification ──────│                              │── fill notification ────→│

  Public sees:    "swap 100 USDC ↔ 1 SOL"
  Public misses:   resting book · order sizes · timing · counterparties`}
      </pre>
    </div>
  );
}
