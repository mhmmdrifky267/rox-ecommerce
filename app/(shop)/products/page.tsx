// app/(shop)/products/page.tsx

import { getPublicProducts } from "@/services/product.service";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import Link from "next/link";

type SearchParams = {
  search?: string;
  category?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "discount";
  promo?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const isPromoMode = params.promo === "1";

  const { products, totalPages, currentPage } = await getPublicProducts({
    search: params.search,
    categorySlug: params.category,
    sort: isPromoMode ? "discount" : params.sort,
    onlyDiscount: isPromoMode,
    page: params.page ? Number(params.page) : 1,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="section-title mb-4">
        <span>{isPromoMode ? "Sedang Diskon" : "Semua Produk"}</span>
        {isPromoMode && (
          <Link href="/products" className="see-all">
            Lihat Semua Produk
          </Link>
        )}
      </div>

      <ProductFilters
        key={`${params.search ?? ""}-${params.category ?? ""}-${params.sort ?? ""}-${params.promo ?? ""}`}
        categories={categories}
      />

      {products.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--gray)" }}>
          Tidak ada produk yang cocok.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
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
      )}

      {/* Pagination sederhana */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{
                pathname: "/products",
                query: { ...params, page: p },
              }}
              className="tag"
              style={{
                background: p === currentPage ? "var(--ink)" : "transparent",
                color: p === currentPage ? "#fff" : "var(--ink)",
                border: p === currentPage ? "none" : "1px dashed var(--line)",
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}