import { PublicKey } from "@solana/web3.js";

export const MB_DEVNET_TEE_HTTP = "https://devnet-tee.magicblock.app";
export const MB_DEVNET_TEE_WS = "wss://devnet-tee.magicblock.app";
export const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";

export const PERMISSION_PROGRAM_ID = new PublicKey(
  "ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1"
);
export const DELEGATION_PROGRAM_ID = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);

export const TEE_VALIDATOR = new PublicKey(
  "MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo"
);

export const MEMBER_FLAG = {
  AUTHORITY: 1 << 0,
  TX_LOGS: 1 << 1,
  TX_BALANCES: 1 << 2,
  TX_MESSAGE: 1 << 3,
  ACCOUNT_SIGNATURES: 1 << 4,
} as const;

export const PAIR = {
  base: { symbol: "SOL", decimals: 9, mint: "So11111111111111111111111111111111111111112" },
  quote: { symbol: "USDC", decimals: 6, mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" },
} as const;
