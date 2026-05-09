import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

export const revalidate = 60;

// Raydium SOL/USDC AMM v4 pool on mainnet
const RAY_SOL_USDC = new PublicKey("58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2");

const RPC_FALLBACKS = [
  process.env.SOLANA_MAINNET_RPC,
  "https://solana-rpc.publicnode.com",
  "https://rpc.ankr.com/solana",
  "https://api.mainnet-beta.solana.com",
].filter(Boolean) as string[];

let cache: { ts: number; payload: unknown } | null = null;
const CACHE_MS = 30_000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.payload);
  }

  for (const url of RPC_FALLBACKS) {
    try {
      const conn = new Connection(url, "confirmed");
      const sigs = await conn.getSignaturesForAddress(RAY_SOL_USDC, { limit: 20 });
      const trades = sigs
        .filter((s) => !s.err)
        .map((s) => ({
          signature: s.signature,
          ts: (s.blockTime ?? Math.floor(Date.now() / 1000)) * 1000,
          slot: s.slot,
        }));
      const payload = { pool: RAY_SOL_USDC.toBase58(), trades, rpc: url };
      cache = { ts: Date.now(), payload };
      return NextResponse.json(payload);
    } catch {
      continue;
    }
  }

  if (cache) return NextResponse.json(cache.payload);
  return NextResponse.json({ pool: RAY_SOL_USDC.toBase58(), trades: [], error: "all RPCs failed" }, { status: 502 });
}
