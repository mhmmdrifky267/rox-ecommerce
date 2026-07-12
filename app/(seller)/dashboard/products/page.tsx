// app/(seller)/dashboard/products/page.tsx
//
// Ini Server Component (tidak ada "use client"), jadi bisa langsung
// query Prisma di sini tanpa perlu fetch ke API sendiri.

import Link from "next/link";
import { auth } from "@/auth";
import { getSellerProducts } from "@/services/product.service";
import { redirect } from "next/navigation";
import { SellerProductRow } from "@/components/product/SellerProductRow";

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
            <SellerProductRow
              key={product.id}
              id={product.id}
              name={product.name}
              categoryName={product.category.name}
              price={product.price}
              totalStock={product.variants.reduce((sum, v) => sum + v.stock, 0)}
              imageUrl={product.images[0]?.url}
            />
          ))}
        </div>
      )}
    </div>
  );
}