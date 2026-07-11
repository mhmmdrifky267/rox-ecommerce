// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrdersFromCart } from "@/services/order.service";
import { snap } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { addressId, shipments } = await request.json();

  if (!addressId || !shipments?.length) {
    return NextResponse.json({ error: "Data checkout tidak lengkap" }, { status: 400 });
  }

  try {
    const orders = await createOrdersFromCart(session.user.id, addressId, shipments);

    // Untuk tiap Order yang berhasil dibuat, minta Snap token ke Midtrans.
    // order_id yang dikirim ke Midtrans = id Order kita sendiri (sudah unik),
    // ini penting supaya nanti webhook bisa mencocokkan balik ke Order yang benar.
    const paymentSessions = await Promise.all(
      orders.map(async (order) => {
        const transaction = await snap.createTransaction({
          transaction_details: {
            order_id: order.id,
            gross_amount: order.totalPrice,
          },
          customer_details: {
            email: session.user.email ?? undefined,
            first_name: session.user.name ?? undefined,
          },
        });

        // Simpan record Payment berstatus PENDING, menunggu webhook Midtrans
        await prisma.payment.create({
          data: {
            orderId: order.id,
            method: "midtrans",
            status: "PENDING",
          },
        });

        return {
          orderId: order.id,
          snapToken: transaction.token,
        };
      })
    );

    return NextResponse.json({ paymentSessions });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}