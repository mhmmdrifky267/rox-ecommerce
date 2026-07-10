// components/product/VariantSelector.tsx
"use client";

import { useState } from "react";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
};

export function VariantSelector({ variants }: { variants: Variant[] }) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? null);
  const selected = variants.find((v) => v.id === selectedId);

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Pilih Varian</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const label = [variant.size, variant.color].filter(Boolean).join(" / ");
          const isOutOfStock = variant.stock === 0;

          return (
            <button
              key={variant.id}
              disabled={isOutOfStock}
              onClick={() => setSelectedId(variant.id)}
              className={`rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                selectedId === variant.id
                  ? "border-black bg-black text-white"
                  : "border-gray-300"
              }`}
            >
              {label || "Default"}
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="mt-2 text-xs text-gray-500">
          {selected.stock > 0
            ? `Stok tersedia: ${selected.stock}`
            : "Stok habis"}
        </p>
      )}

      {/* Tombol "Tambah ke Keranjang" akan kita hubungkan ke Zustand
          store di Tahap 5, sekarang masih placeholder. */}
      <button
        disabled={!selected || selected.stock === 0}
        className="mt-4 w-full rounded-md bg-black py-2 text-white disabled:opacity-40"
      >
        Tambah ke Keranjang
      </button>
    </div>
  );
}