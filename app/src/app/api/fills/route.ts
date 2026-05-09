import { NextRequest, NextResponse } from "next/server";
import { store, type Fill } from "@/lib/order-store";

export async function GET() {
  const fills = store().fills.slice(0, 20);
  return NextResponse.json({ fills });
}

export async function POST(req: NextRequest) {
  const { price, size } = (await req.json()) as { price: number; size: number };
  if (!price || !size) return new NextResponse("missing", { status: 400 });
  const sig = randomSig();
  const fill: Fill = {
    id: `fill_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    price, size, ts: Date.now(),
    signature: sig, buyer: "Hidden", seller: "Hidden",
  };
  store().fills.unshift(fill);
  return NextResponse.json({ fill });
}

function randomSig() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
