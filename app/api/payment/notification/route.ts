// app/api/payment/notification/route.ts
//
// Ini BUKAN dipanggil dari browser kita — ini dipanggil oleh SERVER Midtrans
// setiap kali status pembayaran berubah (misal: user berhasil transfer).
// Kamu wajib daftarkan URL endpoint ini di dashboard Midtrans:
// SETTINGS → Configuration → Payment Notification URL
// (saat development, pakai URL tunnel seperti ngrok karena localhost
// tidak bisa diakses dari internet oleh server Midtrans).

import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    // snap.transaction.notification() otomatis memvalidasi signature key,
    // supaya kita yakin notifikasi ini benar-benar dari Midtrans, bukan
    // orang iseng yang menembak endpoint ini langsung.
    const statusResponse = await snap.transaction.notification(body);

    const orderId = statusResponse.order_id as string;
    const transactionStatus = statusResponse.transaction_status as string;
    const fraudStatus = statusResponse.fraud_status as string | undefined;

    let paymentStatus: "PENDING" | "SUCCESS" | "FAILED" = "PENDING";
    let orderStatus: "PENDING" | "PAID" | "CANCELLED" = "PENDING";

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept" || !fraudStatus) {
        paymentStatus = "SUCCESS";
        orderStatus = "PAID";
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      paymentStatus = "FAILED";
      orderStatus = "CANCELLED";
    }
    // status "pending" (misal masih menunggu transfer VA) dibiarkan PENDING

    await prisma.payment.update({
      where: { orderId },
      data: {
        status: paymentStatus,
        transactionId: statusResponse.transaction_id,
        paidAt: paymentStatus === "SUCCESS" ? new Date() : null,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Gagal memproses notifikasi" }, { status: 500 });
  }
}