// app/(seller)/dashboard/products/page.tsx
//
// Ini Server Component (tidak ada "use client"), jadi bisa langsung
// query Prisma di sini tanpa perlu fetch ke API sendiri.

import Link from "next/link";
import { auth } from "@/auth";
import { getSellerProducts } from "@/services/product.service";
import { redirect } from "next/navigation";

export default async function SellerProductsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    redirect("/login");
  }

  const products = await getSellerProducts(session.user.sellerId);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produk Saya</h1>
        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          + Tambah Produk
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">Belum ada produk. Yuk tambah yang pertama!</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-md border p-3"
            >
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-md bg-gray-100" />
              )}

              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {product.category.name} · Rp{product.price.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-400">
                  Total stok:{" "}
                  {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}