"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SOLANA_DEVNET_RPC } from "@/lib/constants";
import { TeeProvider } from "@/lib/tee-context";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={SOLANA_DEVNET_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TeeProvider>{children}</TeeProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
