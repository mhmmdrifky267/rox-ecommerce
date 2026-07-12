// app/(seller)/dashboard/orders/page.tsx
"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  totalPrice: number;
  itemsTotal: number;
  shippingCost: number;
  courierName: string | null;
  courierService: string | null;
  createdAt: string;
  user: { name: string };
  address: {
    recipient: string;
    fullAddress: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  items: {
    id: string;
    qty: number;
    variant: {
      size: string | null;
      color: string | null;
      product: { name: string; images: { url: string }[] };
    };
  }[];
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

// Tombol aksi yang muncul tergantung status saat ini — mencerminkan
// ALLOWED_TRANSITIONS yang sudah kita definisikan di service.
const nextActionMap: Record<string, { label: string; nextStatus: string } | null> = {
  PENDING: null, // masih nunggu pembayaran, seller belum bisa apa-apa
  PAID: { label: "Proses Pesanan", nextStatus: "PROCESSING" },
  PROCESSING: { label: "Kirim Pesanan", nextStatus: "SHIPPED" },
  SHIPPED: { label: "Tandai Selesai", nextStatus: "COMPLETED" },
  COMPLETED: null,
  CANCELLED: null,
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    const res = await fetch("/api/seller/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  async function handleUpdateStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    const res = await fetch(`/api/seller/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setUpdatingId(null);

    if (res.ok) {
      loadOrders(); // refresh list supaya status & tombol ikut update
    } else {
      const data = await res.json();
      alert(data.error ?? "Gagal update status");
    }
  }

  if (loading) return <div className="py-10 text-center">Memuat pesanan...</div>;

  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="mb-6 text-2xl font-bold">Pesanan Masuk</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const action = nextActionMap[order.status];

            return (
              <div key={order.id} className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 border-t pt-3">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm">
                      {item.variant.product.name}
                      {item.variant.size && ` (${item.variant.size})`} x{item.qty}
                    </p>
                  ))}
                </div>

                <div className="mt-3 border-t pt-3 text-sm text-gray-600">
                  <p>
                    Kirim ke: {order.address.recipient}, {order.address.fullAddress},{" "}
                    {order.address.city} {order.address.postalCode}
                  </p>
                  {order.courierName && (
                    <p>
                      Kurir: {order.courierName.toUpperCase()} - {order.courierService}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <p className="font-semibold">
                    Total: Rp{order.totalPrice.toLocaleString("id-ID")}
                  </p>

                  {action && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, action.nextStatus)}
                      disabled={updatingId === order.id}
                      className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {updatingId === order.id ? "Memproses..." : action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}