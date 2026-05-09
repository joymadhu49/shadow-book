// In-memory store. Replace with on-chain reads once Anchor program deploys.

export type Order = {
  id: string;
  owner: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  filled: number;
  status: "open" | "filled" | "cancelled" | "matching";
  ts: number;
};

export type Fill = {
  id: string;
  price: number;
  size: number;
  ts: number;
  signature: string;
  buyer: string;
  seller: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __orderStore: { orders: Order[]; fills: Fill[] } | undefined;
}

export function store() {
  if (!globalThis.__orderStore) {
    globalThis.__orderStore = { orders: [], fills: [] };
  }
  return globalThis.__orderStore;
}
