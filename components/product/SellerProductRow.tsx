// components/product/SellerProductRow.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SellerProductRowProps = {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  totalStock: number;
  imageUrl?: string;
};

export function SellerProductRow({
  id,
  name,
  categoryName,
  price,
  totalStock,
  imageUrl,
}: SellerProductRowProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    setDeleting(true);
    const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      router.refresh(); // muat ulang data Server Component di atasnya
    } else {
      const data = await res.json();
      alert(data.error ?? "Gagal menghapus produk");
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-md border p-3">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-16 w-16 rounded-md object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded-md bg-gray-100" />
      )}

      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">
          {categoryName} · Rp{price.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-gray-400">Total stok: {totalStock}</p>
      </div>

      <div className="flex gap-3 text-sm">
        <Link href={`/dashboard/products/${id}/edit`} className="text-blue-600">
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 disabled:opacity-50"
        >
          {deleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </div>
  );
}