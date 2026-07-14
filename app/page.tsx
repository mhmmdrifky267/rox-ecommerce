// app/page.tsx
//
// Susunan section (dari yang paling "menarik perhatian" ke yang paling umum):
// 1. Hero
// 2. Promo — 10 produk diskon terbesar, identitas visual beda (aksen gelap+merah)
// 3. "Rekomendasi Untukmu" — personal, baca histori lihat (kategori+brand)
// 4. "Dilihat Terakhir" — literal histori lihat user
// 5. "Produk Terlaris" — fallback yang selalu ada buat semua orang

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getRecentlyViewed,
  getPopularProducts,
  getPersonalizedRecommendations,
} from "@/services/recommendation.service";
import { getPromoProducts } from "@/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { PromoSection } from "@/components/product/PromoSection";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [recentlyViewed, popularProducts, categories, promoProducts, personalized] =
    await Promise.all([
      userId ? getRecentlyViewed(userId) : Promise.resolve([]),
      getPopularProducts(),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      getPromoProducts(10),
      userId
        ? getPersonalizedRecommendations(userId)
        : Promise.resolve({ products: [], basisLabel: null }),
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

      {/* ---- Promo ---- */}
      <PromoSection products={promoProducts} />

      {/* ---- Rekomendasi Untukmu (personal, baca kategori+brand yang sering dilihat) ---- */}
      {personalized.products.length > 0 && (
        <section className="mb-10">
          <div className="section-title mb-1">
            <span>Rekomendasi Untukmu</span>
            <Link href="/products" className="see-all">
              Lihat Semua
            </Link>
          </div>
          {personalized.basisLabel && (
            <p className="font-mono mb-4 text-[10.5px]" style={{ color: "var(--gray)" }}>
              {personalized.basisLabel}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {personalized.products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                discountPercent={product.discountPercent}
                createdAt={product.createdAt}
                imageUrl={product.images[0]?.url}
                storeName={product.seller.storeName}
              />
            ))}
          </div>
        </section>
      )}

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
                discountPercent={product.discountPercent}
                createdAt={product.createdAt}
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
                discountPercent={product.discountPercent}
                createdAt={product.createdAt}
                imageUrl={product.images[0]?.url}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}