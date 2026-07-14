// lib/pricing.ts
//
// Satu fungsi dipakai di mana-mana (ProductCard, detail produk, checkout)
// supaya logika "harga setelah diskon" konsisten — kalau nanti aturannya
// berubah (misal max diskon 50%), cukup ubah di SATU tempat ini.

export function getEffectivePrice(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100));
}

export function hasActiveDiscount(discountPercent: number | null | undefined): boolean {
  return !!discountPercent && discountPercent > 0;
}