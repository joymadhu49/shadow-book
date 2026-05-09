import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

export const revalidate = 5;

const DEVNET = "https://api.devnet.solana.com";
const TEE = "https://devnet-tee.magicblock.app";

let cache: { ts: number; payload: unknown } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 5_000) return NextResponse.json(cache.payload);
  try {
    const conn = new Connection(DEVNET, "confirmed");
    const t0 = Date.now();
    const [slot, blockHeight, version] = await Promise.all([
      conn.getSlot(),
      conn.getBlockHeight(),
      conn.getVersion().catch(() => null),
    ]);
    const rttMs = Date.now() - t0;

    // Probe TEE health
    let teeOk = false;
    try {
      const r = await fetch(`${TEE}/health`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
      teeOk = r.ok;
    } catch {}

    const payload = {
      cluster: "devnet",
      slot,
      blockHeight,
      version: version?.["solana-core"] ?? null,
      rttMs,
      tee: { ok: teeOk, validator: "MTEW…3xzo" },
      ts: Date.now(),
    };
    cache = { ts: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (e) {
    if (cache) return NextResponse.json(cache.payload);
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
