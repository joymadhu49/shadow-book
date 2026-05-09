import { NextRequest, NextResponse } from "next/server";
import { store, type Order } from "@/lib/order-store";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  const s = store();
  const orders = owner ? s.orders.filter((o) => o.owner === owner) : s.orders;
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { side, price, size, owner } = body as {
    side: "buy" | "sell"; price: number; size: number; owner?: string;
  };
  if (!side || !price || !size) {
    return new NextResponse("missing fields", { status: 400 });
  }
  const order: Order = {
    id: `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    owner: owner ?? "anon",
    side, price, size, filled: 0, status: "open", ts: Date.now(),
  };
  store().orders.unshift(order);
  return NextResponse.json({ order });
}
