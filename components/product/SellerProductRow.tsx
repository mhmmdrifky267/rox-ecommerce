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
  discountPercent?: number;
  totalStock: number;
  imageUrl?: string;
};

export function SellerProductRow({
  id,
  name,
  categoryName,
  price,
  discountPercent = 0,
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
    <div
      className="flex items-center gap-4 p-3"
      style={{ border: "1px solid var(--line)", borderRadius: "4px", background: "#fff" }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-16 w-16 object-cover"
          style={{ borderRadius: "3px" }}
        />
      ) : (
        <div className="h-16 w-16" style={{ background: "var(--muted)", borderRadius: "3px" }} />
      )}

      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-[13.5px] font-semibold">{name}</p>
          {discountPercent > 0 && <span className="tag tag-moss">-{discountPercent}%</span>}
        </div>
        <p className="font-mono text-[11px]" style={{ color: "var(--gray)" }}>
          {categoryName} · Rp{price.toLocaleString("id-ID")}
        </p>
        <p
          className="font-mono text-[10px]"
          style={{ color: totalStock < 5 ? "var(--stamp-red)" : "var(--gray)" }}
        >
          Stok: {totalStock}
          {totalStock < 5 && " · Menipis"}
        </p>
      </div>

      <div className="flex gap-3 text-[12.5px]">
        <Link href={`/dashboard/products/${id}/edit`} style={{ color: "var(--stamp-blue)" }}>
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ color: "var(--stamp-red)" }}
          className="disabled:opacity-50"
        >
          {deleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </div>
  );
}