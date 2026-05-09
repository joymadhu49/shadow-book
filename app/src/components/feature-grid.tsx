const FEATURES = [
  {
    tag: "Privacy",
    title: "TDX-secured order book",
    body: "Bids and asks live inside an Intel TDX enclave. Even the validator host can't read them. Only the match engine + owner can.",
    icon: ShieldIcon,
  },
  {
    tag: "Performance",
    title: "Sub-50ms execution",
    body: "Match engine ticks every 500ms inside the PER. Settlement is atomic via SPL Token CPI. No batched epochs.",
    icon: BoltIcon,
  },
  {
    tag: "Fairness",
    title: "Anti-MEV by construction",
    body: "Searchers can't sandwich what they can't see. No public mempool, no resting book leak, no front-running surface.",
    icon: LockIcon,
  },
  {
    tag: "Compliance",
    title: "Onchain attestable",
    body: "TEE produces TDX quotes you can verify. Permission Program enforces account-level ACLs. Range AML built in.",
    icon: BadgeIcon,
  },
  {
    tag: "Composable",
    title: "Settles to Solana",
    body: "Fills commit back to L1. Public sees a swap. Other Solana apps can compose against the result, not the book.",
    icon: LinkIcon,
  },
  {
    tag: "Open",
    title: "Built on MagicBlock PER",
    body: "Uses the published Private Ephemeral Rollups SDK + Permission + Delegation programs. Source on GitHub.",
    icon: BoxIcon,
  },
];

export function FeatureGrid() {
  return (
    <section className="border-y border-[var(--mb-border)] bg-[rgba(10,14,26,0.4)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[var(--mb-accent)] font-semibold">
            <span className="w-1 h-1 rounded-full bg-[var(--mb-accent)]" />
            Why Shadow Book
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-[1.1]">
            A trading venue built on what other DEXes leak.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--mb-border)] rounded-xl overflow-hidden border border-[var(--mb-border)]">
          {FEATURES.map((f, i) => (
            <Feature key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Feature({ tag, title, body, icon: Icon }: { tag: string; title: string; body: string; icon: React.ComponentType }) {
  return (
    <div className="bg-[var(--mb-bg-secondary)] p-6 hover:bg-[var(--mb-bg-elevated)] transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-lg bg-[rgba(0,217,255,0.1)] border border-[rgba(0,217,255,0.25)] flex items-center justify-center text-[var(--mb-accent)] group-hover:scale-110 group-hover:border-[var(--mb-accent)] transition-all">
          <Icon />
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--mb-bg-primary)] text-[var(--mb-text-secondary)] border border-[var(--mb-border)]">
          {tag}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[13px] text-[var(--mb-text-secondary)] leading-relaxed">{body}</p>
    </div>
  );
}

/* — icons (16x16, currentColor) — */
function ShieldIcon() { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2.5 4v4.5c0 3.5 2.4 5.5 5.5 6.5 3.1-1 5.5-3 5.5-6.5V4L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function BoltIcon() { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3.5 9h4l-1 5.5 6-7.5h-4l1-5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/></svg>); }
function LockIcon() { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>); }
function BadgeIcon() { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 9.5L4 14l4-1.5L12 14l-1.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>); }
function LinkIcon() { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5l3-3M6 5h-.5a3 3 0 100 6H7M9 11h.5a3 3 0 100-6H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>); }
function BoxIcon() { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 5L8 2l5.5 3v6L8 14l-5.5-3V5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M2.5 5L8 8l5.5-3M8 8v6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>); }
