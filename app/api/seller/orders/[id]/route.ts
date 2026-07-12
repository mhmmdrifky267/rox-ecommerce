// app/api/seller/orders/[id]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateOrderStatus } from "@/services/order.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!status) {
    return NextResponse.json({ error: "Status wajib diisi" }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, session.user.sellerId, status);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}