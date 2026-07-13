// components/product/ProductCard.tsx
//
// Server Component murni (tidak ada "use client") — tidak butuh interaksi,
// cuma menampilkan data. Ini membuatnya ringan: nol JavaScript dikirim
// ke browser untuk komponen ini.

// components/product/ProductCard.tsx

import Link from "next/link";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  storeName?: string;
  createdAt?: string | Date; // dipakai untuk badge "Baru" otomatis
};

// Produk yang dibuat dalam 7 hari terakhir otomatis dapat badge "Baru" —
// meniru penanda "Baru"/"Sale" di mockup, tapi datanya asli (bukan hardcode).
function isNew(createdAt?: string | Date) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 7;
}

export function ProductCard({
  slug,
  name,
  price,
  imageUrl,
  storeName,
  createdAt,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="product-card">
      <div className="product-img">
        {isNew(createdAt) && <span className="stamp">Baru</span>}
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
        <span className="product-price">Rp{price.toLocaleString("id-ID")}</span>
      </div>
    </Link>
  );
}