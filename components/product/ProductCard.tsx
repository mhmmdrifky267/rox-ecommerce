// components/product/ProductCard.tsx
//
// Server Component murni (tidak ada "use client") — tidak butuh interaksi,
// cuma menampilkan data. Ini membuatnya ringan: nol JavaScript dikirim
// ke browser untuk komponen ini.

// components/product/ProductCard.tsx

import Link from "next/link";
import { getEffectivePrice, hasActiveDiscount } from "@/lib/pricing";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  discountPercent?: number;
  imageUrl?: string;
  storeName?: string;
  createdAt?: string | Date; // dipakai untuk badge "Baru" otomatis
};

// Produk yang dibuat dalam 14 hari terakhir otomatis dapat badge "Baru".
function isNew(createdAt?: string | Date) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

export function ProductCard({
  slug,
  name,
  price,
  discountPercent = 0,
  imageUrl,
  storeName,
  createdAt,
}: ProductCardProps) {
  const onSale = hasActiveDiscount(discountPercent);
  const finalPrice = getEffectivePrice(price, discountPercent);

  return (
    <Link href={`/products/${slug}`} className="product-card">
      <div className="product-img">
        {/* Kalau produk baru DAN diskon bentrok posisinya, diskon diprioritaskan
            (lebih relevan buat keputusan beli) */}
        {onSale ? (
          <span className="stamp" style={{ color: "var(--stamp-red)", borderColor: "var(--stamp-red)" }}>
            -{discountPercent}%
          </span>
        ) : (
          isNew(createdAt) && <span className="stamp">Baru</span>
        )}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} />
        ) : (
          <div
            className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide"
            style={{ color: "var(--gray)" }}
          >
            Tidak ada gambar
          </div>
        )}
      </div>

      <div className="product-body">
        {storeName && <div className="product-store">{storeName}</div>}
        <div className="product-name">{name}</div>

        {onSale ? (
          <div className="flex items-baseline gap-1.5">
            <span className="product-price" style={{ color: "var(--stamp-red)" }}>
              Rp{finalPrice.toLocaleString("id-ID")}
            </span>
            <span
              className="font-mono text-[10px] line-through"
              style={{ color: "var(--gray)" }}
            >
              Rp{price.toLocaleString("id-ID")}
            </span>
          </div>
        ) : (
          <span className="product-price">Rp{price.toLocaleString("id-ID")}</span>
        )}
      </div>
    </Link>
  );
}