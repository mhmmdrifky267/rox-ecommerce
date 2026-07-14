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

  // Ringkasan cepat, dipakai untuk "pemanis" tag di atas daftar produk —
  // datanya asli dihitung dari produk yang ada, bukan dummy.
  const totalProducts = products.length;
  const onSaleCount = products.filter((p) => p.discountPercent > 0).length;
  const lowStockCount = products.filter(
    (p) => p.variants.reduce((sum, v) => sum + v.stock, 0) < 5
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="section-title">
            <span>Produk Saya</span>
          </div>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--gray)" }}>
            Kelola katalog toko kamu.
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn btn-primary">
          + Tambah Produk
        </Link>
      </div>

      {/* ---- Quick stats, gaya tag mono ---- */}
      {totalProducts > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="tag tag-ghost">{totalProducts} Produk</span>
          {onSaleCount > 0 && (
            <span className="tag tag-moss">{onSaleCount} Sedang Diskon</span>
          )}
          {lowStockCount > 0 && (
            <span className="tag" style={{ background: "var(--stamp-red)" }}>
              {lowStockCount} Stok Menipis
            </span>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16 text-center"
          style={{ border: "1px dashed var(--line)", borderRadius: "4px" }}
        >
          <span className="stamp">Kosong</span>
          <p className="text-[13px]" style={{ color: "var(--gray)" }}>
            Belum ada produk. Yuk tambah yang pertama!
          </p>
          <Link href="/dashboard/products/new" className="btn btn-outline mt-2">
            + Tambah Produk
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <SellerProductRow
              key={product.id}
              id={product.id}
              name={product.name}
              categoryName={product.category.name}
              price={product.price}
              discountPercent={product.discountPercent}
              totalStock={product.variants.reduce((sum, v) => sum + v.stock, 0)}
              imageUrl={product.images[0]?.url}
            />
          ))}
        </div>
      )}
    </div>
  );
}