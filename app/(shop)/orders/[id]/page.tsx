// app/(shop)/orders/[id]/page.tsx

import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrderById } from "@/services/order.service";

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const order = await getOrderById(id, session.user.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      <div className="mb-4 rounded-md border p-4">
        <p className="text-sm text-gray-500">Toko</p>
        <p className="font-medium">{order.seller.storeName}</p>
      </div>

      <div className="mb-4 rounded-md border p-4">
        <p className="mb-2 text-sm font-medium">Alamat Pengiriman</p>
        <p className="text-sm text-gray-600">
          {order.address.recipient} — {order.address.fullAddress},{" "}
          {order.address.city} {order.address.postalCode}
        </p>
        {order.courierName && (
          <p className="mt-1 text-sm text-gray-500">
            Kurir: {order.courierName.toUpperCase()} - {order.courierService}
          </p>
        )}
      </div>

      <div className="mb-4 rounded-md border p-4">
        <p className="mb-2 text-sm font-medium">Produk</p>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.variant.product.name} x{item.qty}
              </span>
              <span>
                Rp{(item.priceAtOrder * item.qty).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp{order.itemsTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span>Rp{order.shippingCost.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>Rp{order.totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}