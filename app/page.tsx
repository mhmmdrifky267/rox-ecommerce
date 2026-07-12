// app/page.tsx
//
// Ini menggantikan redirect sementara ke /login dari Tahap 6.
// Section-nya disusun bertingkat kepersonalan:
// 1. "Dilihat Terakhir" — kalau user login dan pernah lihat produk
// 2. "Direkomendasikan untuk Kamu" — berdasar kategori pembelian (kalau ada)
// 3. "Produk Terlaris" — fallback yang selalu ada, cocok untuk semua orang

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getRecentlyViewed,
  getPopularProducts,
} from "@/services/recommendation.service";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [recentlyViewed, popularProducts, categories] = await Promise.all([
    userId ? getRecentlyViewed(userId) : Promise.resolve([]),
    getPopularProducts(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* ---- Hero sederhana ---- */}
      <div className="mb-10 rounded-lg bg-gray-100 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold">Belanja Fashion Favoritmu</h1>
        <p className="mt-2 text-gray-600">
          Temukan produk dari ribuan toko terpercaya
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-md bg-black px-6 py-2 text-white"
        >
          Mulai Belanja
        </Link>
      </div>

      {/* ---- Kategori cepat ---- */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="rounded-full border px-4 py-1.5 text-sm hover:bg-gray-50"
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* ---- Dilihat terakhir (hanya untuk user login yang punya histori) ---- */}
      {recentlyViewed.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold">Dilihat Terakhir</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recentlyViewed.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                imageUrl={product.images[0]?.url}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Produk terlaris ---- */}
      <section>
        <h2 className="mb-4 text-lg font-bold">Produk Terlaris</h2>
        {popularProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada produk.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                imageUrl={product.images[0]?.url}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}