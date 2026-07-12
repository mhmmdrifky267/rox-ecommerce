// app/api/seller/stats/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSellerStats } from "@/services/order.service";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const stats = await getSellerStats(session.user.sellerId);
  return NextResponse.json(stats);
}