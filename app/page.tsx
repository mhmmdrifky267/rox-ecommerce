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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      {/* ---- Hero sesuai referensi: latar ink, stamp "Musim Baru", tag CTA ---- */}
      <div
        className="mb-10 flex flex-col items-start justify-between gap-6 rounded-md px-6 py-9 sm:flex-row sm:items-center sm:px-10 sm:py-12"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div>
          <span className="stamp" style={{ color: "#fff", borderColor: "#fff", background: "transparent" }}>
            Musim Baru
          </span>
          <p className="font-display mt-3 max-w-md text-[26px] font-black leading-tight sm:text-[34px]">
            Koleksi Akhir Tahun, Untuk Setiap Gaya.
          </p>
          <Link href="/products" className="tag mt-4 inline-flex" style={{ background: "var(--stamp-red)" }}>
            Belanja Sekarang →
          </Link>
        </div>
      </div>

      {/* ---- Kategori cepat, gaya tag-ghost ---- */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="tag tag-ghost"
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* ---- Dilihat terakhir (hanya untuk user login yang punya histori) ---- */}
      {recentlyViewed.length > 0 && (
        <section className="mb-10">
          <div className="section-title mb-4">
            <span>Dilihat Terakhir</span>
            <Link href="/products" className="see-all">
              Lihat Semua
            </Link>
          </div>
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
        <div className="section-title mb-4">
          <span>Produk Terlaris</span>
          <Link href="/products" className="see-all">
            Lihat Semua
          </Link>
        </div>
        {popularProducts.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--gray)" }}>
            Belum ada produk.
          </p>
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