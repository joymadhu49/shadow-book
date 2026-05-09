"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrice } from "@/lib/use-price";
import { Logo } from "@/components/logo";
import { TeeButton } from "@/components/tee-button";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const NAV = [
  { href: "/", label: "Home" },
  { href: "/trade", label: "Trade" },
  { href: "/orders", label: "Orders" },
  { href: "/fills", label: "Fills" },
];

export function Header() {
  const path = usePathname();
  const price = usePrice();
  const up = (price?.change24h ?? 0) >= 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--mb-border)] backdrop-blur-xl bg-[rgba(10,14,26,0.78)]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={32} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-[var(--mb-text-primary)] tracking-tight text-[16px]">Shadow</span>
              <span className="font-semibold bg-gradient-to-r from-[#00D9FF] to-[#4DA8FF] bg-clip-text text-transparent tracking-tight text-[16px]">Book</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-[13px]">
            {NAV.map((item) => {
              const active = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${active ? "text-[var(--mb-text-primary)] bg-[var(--mb-bg-elevated)]" : "text-[var(--mb-text-secondary)] hover:text-[var(--mb-text-primary)]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/api-reference/per/introduction"
              target="_blank"
              className="px-3 py-1.5 rounded-md text-[var(--mb-text-secondary)] hover:text-[var(--mb-text-primary)] transition-colors"
            >
              Docs <span className="text-[10px] opacity-60">↗</span>
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <PriceBadge price={price?.usd} up={up} change={price?.change24h ?? 0} />
          <TeeButton />
          <WalletMultiButton style={{
            background: "linear-gradient(135deg,#00D9FF,#4DA8FF)",
            color: "#0A0E1A",
            borderRadius: 8,
            fontWeight: 600,
            height: 34,
            fontSize: 12,
            padding: "0 14px",
          }} />
        </div>
      </div>
    </header>
  );
}

function PriceBadge({ price, up, change }: { price?: number; up: boolean; change: number }) {
  if (!price) return (
    <span className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[var(--mb-border)] text-xs">
      <span className="text-[var(--mb-text-muted)] font-mono">SOL</span>
      <span className="text-[var(--mb-text-muted)] font-mono">—</span>
    </span>
  );
  return (
    <span className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[var(--mb-border)] text-xs hover:border-[var(--mb-accent)] transition-colors">
      <span className="text-[var(--mb-text-muted)] font-semibold tracking-wider text-[10px]">SOL</span>
      <span className="font-mono tabular-nums font-medium text-[var(--mb-text-primary)]">${price.toFixed(2)}</span>
      <span className={`font-mono tabular-nums text-[11px] ${up ? "text-[var(--mb-success)]" : "text-[var(--mb-danger)]"}`}>
        {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
      </span>
    </span>
  );
}
