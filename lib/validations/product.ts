// lib/validations/product.ts

import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().int().min(0, "Stok tidak boleh negatif"),
});

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  brand: z.string().max(50).optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().int().positive("Harga harus lebih dari 0"),
  discountPercent: z
    .number()
    .int()
    .min(0, "Diskon minimal 0%")
    .max(90, "Diskon maksimal 90%")
    .default(0),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  images: z
    .array(z.string().url())
    .min(1, "Minimal 1 gambar produk")
    .max(5, "Maksimal 5 gambar produk"),
  variants: z
    .array(productVariantSchema)
    .min(1, "Minimal 1 varian (ukuran/warna/stok)"),
});

export type ProductInput = z.infer<typeof productSchema>;