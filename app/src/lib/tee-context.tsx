"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  authenticate,
  clearStoredSession,
  loadStoredSession,
  makeConnection,
  type TeeSession,
} from "@/lib/tee";

export type AuthStatus = "idle" | "verifying" | "signing" | "ready" | "error";

type Ctx = {
  session: TeeSession | null;
  status: AuthStatus;
  error: string | null;
  authenticate: () => Promise<void>;
  signOut: () => void;
};

const TeeCtx = createContext<Ctx | null>(null);

export function TeeProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage, connected } = useWallet();
  const [session, setSession] = useState<TeeSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage when wallet connects
  useEffect(() => {
    if (!connected || !publicKey) {
      setSession(null);
      setStatus("idle");
      setError(null);
      return;
    }
    const stored = loadStoredSession(publicKey.toBase58());
    if (stored) {
      const { connection, rpcUrl, wsUrl } = makeConnection(stored.token);
      setSession({
        connection, rpcUrl, wsUrl,
        token: stored.token,
        expiresAt: stored.expiresAt,
        pubkey: stored.pubkey,
      });
      setStatus("ready");
    } else {
      setSession(null);
      setStatus("idle");
    }
  }, [connected, publicKey]);

  // Auto-clear expired sessions
  useEffect(() => {
    if (!session) return;
    const ms = session.expiresAt - Date.now();
    if (ms <= 0) {
      clearStoredSession();
      setSession(null);
      setStatus("idle");
      return;
    }
    const id = setTimeout(() => {
      clearStoredSession();
      setSession(null);
      setStatus("idle");
    }, ms);
    return () => clearTimeout(id);
  }, [session]);

  const doAuth = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    setError(null);
    try {
      const s = await authenticate(publicKey, signMessage, setStatus);
      setSession(s);
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  }, [publicKey, signMessage]);

  const signOut = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setStatus("idle");
    setError(null);
  }, []);

  return (
    <TeeCtx.Provider value={{ session, status, error, authenticate: doAuth, signOut }}>
      {children}
    </TeeCtx.Provider>
  );
}

export function useTee() {
  const c = useContext(TeeCtx);
  if (!c) throw new Error("useTee must be used inside TeeProvider");
  return c;
}
