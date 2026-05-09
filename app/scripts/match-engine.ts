/**
 * Shadow Book — match engine.
 *
 * Polls the TEE RPC for open orders, walks the book by price-time priority,
 * and submits `match_tick` instructions for crossing pairs.
 *
 * MVP for hackathon: walks the in-memory order store via local API.
 * Production: connects to PER, reads delegated Order accounts, signs as
 * ENGINE_AUTHORITY (= MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo).
 */

const TICK_MS = 500;
const API = process.env.API ?? "http://localhost:3000";

type Order = {
  id: string;
  owner: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  filled: number;
  status: "open" | "filled" | "cancelled" | "matching";
  ts: number;
};

async function fetchOrders(): Promise<Order[]> {
  const r = await fetch(`${API}/api/orders`);
  return (await r.json()).orders;
}

async function recordFill(price: number, size: number) {
  await fetch(`${API}/api/fills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price, size }),
  }).catch(() => {});
}

async function markFilled(id: string, addedFilled: number) {
  await fetch(`${API}/api/orders/${id}/fill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addedFilled }),
  }).catch(() => {});
}

function tick(orders: Order[]) {
  const open = orders.filter((o) => o.status === "open" && o.size > o.filled);
  const buys = open.filter((o) => o.side === "buy").sort((a, b) => b.price - a.price || a.ts - b.ts);
  const sells = open.filter((o) => o.side === "sell").sort((a, b) => a.price - b.price || a.ts - b.ts);

  const fills: { buy: Order; sell: Order; size: number; price: number }[] = [];
  for (const buy of buys) {
    let buyRem = buy.size - buy.filled;
    if (buyRem <= 0) continue;
    for (const sell of sells) {
      if (sell.price > buy.price) break;
      const sellRem = sell.size - sell.filled;
      if (sellRem <= 0) continue;
      const size = Math.min(buyRem, sellRem);
      const price = (buy.price + sell.price) / 2; // midpoint
      fills.push({ buy, sell, size, price });
      buy.filled += size;
      sell.filled += size;
      buyRem -= size;
      if (buyRem <= 0) break;
    }
  }
  return fills;
}

async function loop() {
  console.log(`[shadow-book] match engine started · tick=${TICK_MS}ms · api=${API}`);
  for (;;) {
    try {
      const orders = await fetchOrders();
      const fills = tick(orders);
      for (const f of fills) {
        console.log(`[fill] ${f.size.toFixed(4)} @ ${f.price.toFixed(4)}  buy=${f.buy.id.slice(-6)} sell=${f.sell.id.slice(-6)}`);
        await Promise.all([
          recordFill(f.price, f.size),
          markFilled(f.buy.id, f.size),
          markFilled(f.sell.id, f.size),
        ]);
      }
    } catch (e) {
      console.error("[engine error]", (e as Error).message);
    }
    await new Promise((r) => setTimeout(r, TICK_MS));
  }
}

loop();
