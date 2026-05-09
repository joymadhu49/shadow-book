"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import { getAuthToken, verifyTeeRpcIntegrity } from "@magicblock-labs/ephemeral-rollups-sdk";
import { MB_DEVNET_TEE_HTTP, MB_DEVNET_TEE_WS } from "./constants";

type SignMessage = (msg: Uint8Array) => Promise<Uint8Array>;

export type TeeSession = {
  connection: Connection;
  token: string;
  expiresAt: number;
  rpcUrl: string;
  wsUrl: string;
  pubkey: string;
};

const STORAGE_KEY = "shadowbook:tee-session:v1";

type Stored = { token: string; expiresAt: number; pubkey: string };

export function loadStoredSession(pubkey: string): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed.pubkey !== pubkey) return null;
    if (parsed.expiresAt <= Date.now() + 30_000) return null;
    return parsed;
  } catch { return null; }
}

export function persistSession(s: Stored) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function makeConnection(token: string): { connection: Connection; rpcUrl: string; wsUrl: string } {
  const rpcUrl = `${MB_DEVNET_TEE_HTTP}?token=${token}`;
  const wsUrl = `${MB_DEVNET_TEE_WS}?token=${token}`;
  const connection = new Connection(rpcUrl, { wsEndpoint: wsUrl, commitment: "confirmed" });
  return { connection, rpcUrl, wsUrl };
}

export async function authenticate(
  publicKey: PublicKey,
  signMessage: SignMessage,
  onStage?: (s: "verifying" | "signing") => void
): Promise<TeeSession> {
  onStage?.("verifying");
  await verifyTeeRpcIntegrity(MB_DEVNET_TEE_HTTP);
  onStage?.("signing");
  const { token, expiresAt } = await getAuthToken(MB_DEVNET_TEE_HTTP, publicKey, signMessage);
  const pubkey = publicKey.toBase58();
  persistSession({ token, expiresAt, pubkey });
  const { connection, rpcUrl, wsUrl } = makeConnection(token);
  return { connection, token, expiresAt, rpcUrl, wsUrl, pubkey };
}
