// app/api/checkout/summary/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCartGroupedBySeller } from "@/services/cart.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const groups = await getCartGroupedBySeller(session.user.id);
  return NextResponse.json(groups);
}