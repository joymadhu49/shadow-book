import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/order-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { addedFilled } = (await req.json()) as { addedFilled: number };
  const o = store().orders.find((x) => x.id === id);
  if (!o) return new NextResponse("not found", { status: 404 });
  o.filled = Math.min(o.size, o.filled + addedFilled);
  if (o.filled >= o.size) o.status = "filled";
  return NextResponse.json({ order: o });
}
