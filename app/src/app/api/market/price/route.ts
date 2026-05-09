import { NextResponse } from "next/server";

export const revalidate = 30;

type Price = {
  usd: number;
  change24h: number;
  vol24h: number;
  high24h?: number;
  low24h?: number;
  marketCap?: number;
  ath?: number;
  athChange?: number;
  source: string;
  ts: number;
};

let cache: { ts: number; payload: Price } | null = null;
const CACHE_MS = 30_000;

async function fromCoinGecko(): Promise<Price> {
  const r = await fetch(
    "https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false",
    { next: { revalidate: 30 } }
  );
  if (!r.ok) throw new Error(`coingecko ${r.status}`);
  const j = await r.json();
  const m = j.market_data;
  return {
    usd: m.current_price.usd,
    change24h: m.price_change_percentage_24h ?? 0,
    vol24h: m.total_volume.usd ?? 0,
    high24h: m.high_24h?.usd,
    low24h: m.low_24h?.usd,
    marketCap: m.market_cap?.usd,
    ath: m.ath?.usd,
    athChange: m.ath_change_percentage?.usd,
    source: "coingecko",
    ts: Date.now(),
  };
}

async function fromJupiter(): Promise<Price> {
  const r = await fetch(
    "https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112",
    { next: { revalidate: 30 } }
  );
  if (!r.ok) throw new Error(`jupiter ${r.status}`);
  const j = await r.json();
  const k = "So11111111111111111111111111111111111111112";
  return {
    usd: j[k]?.usdPrice ?? j.data?.[k]?.price ?? 0,
    change24h: 0, vol24h: 0,
    source: "jupiter",
    ts: Date.now(),
  };
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.payload);
  }
  try {
    const p = await fromCoinGecko();
    cache = { ts: Date.now(), payload: p };
    return NextResponse.json(p);
  } catch {
    try {
      const p = await fromJupiter();
      cache = { ts: Date.now(), payload: p };
      return NextResponse.json(p);
    } catch (e) {
      if (cache) return NextResponse.json(cache.payload);
      return NextResponse.json({ error: (e as Error).message }, { status: 502 });
    }
  }
}
