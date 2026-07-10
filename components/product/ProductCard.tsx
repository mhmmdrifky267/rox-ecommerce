// components/product/ProductCard.tsx
//
// Server Component murni (tidak ada "use client") — tidak butuh interaksi,
// cuma menampilkan data. Ini membuatnya ringan: nol JavaScript dikirim
// ke browser untuk komponen ini.

import Link from "next/link";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  storeName?: string;
};

export function ProductCard({
  slug,
  name,
  price,
  imageUrl,
  storeName,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group block overflow-hidden rounded-lg border transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Tidak ada gambar
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium">{name}</p>
        <p className="mt-1 font-semibold">
          Rp{price.toLocaleString("id-ID")}
        </p>
        {storeName && (
          <p className="mt-0.5 text-xs text-gray-500">{storeName}</p>
        )}
      </div>
    </Link>
  );
}