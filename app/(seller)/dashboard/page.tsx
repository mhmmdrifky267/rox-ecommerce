// app/(seller)/dashboard/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getSellerStats } from "@/services/order.service";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    redirect("/login");
  }

  const stats = await getSellerStats(session.user.sellerId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard Toko</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-md border p-4">
          <p className="text-sm text-gray-500">Total Pendapatan</p>
          <p className="mt-1 text-xl font-bold">
            Rp{stats.totalRevenue.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            dari pesanan yang sudah dibayar
          </p>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-sm text-gray-500">Total Pesanan</p>
          <p className="mt-1 text-xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-sm text-gray-500">Produk Terlaris</p>
          <p className="mt-1 text-lg font-bold">
            {stats.bestSellingProductName ?? "Belum ada data"}
          </p>
          {stats.bestSellingProductName && (
            <p className="mt-1 text-xs text-gray-400">
              {stats.bestSellingQty} terjual
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard/orders"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Kelola Pesanan
        </Link>
        <Link
          href="/dashboard/products"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Kelola Produk
        </Link>
      </div>
    </div>
  );
}