import { NextResponse } from "next/server";
import { store } from "@/lib/order-store";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const s = store();
  const o = s.orders.find((x) => x.id === id);
  if (!o) return new NextResponse("not found", { status: 404 });
  o.status = "cancelled";
  return NextResponse.json({ ok: true });
}
