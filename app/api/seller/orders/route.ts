// app/api/seller/orders/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSellerOrders } from "@/services/order.service";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const orders = await getSellerOrders(session.user.sellerId);
  return NextResponse.json(orders);
}