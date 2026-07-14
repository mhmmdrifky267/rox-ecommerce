// store/cart.store.ts
//
// Pola di sini: setiap aksi (add/update/remove) langsung memanggil API,
// lalu begitu API sukses, kita re-fetch cart terbaru dari server dan
// simpan ke store. Ini disebut "server sebagai sumber kebenaran" —
// sedikit lebih banyak network request, tapi menghindari bug cart
// yang "kelihatan beda" antara satu tab browser dengan tab lainnya.

import { create } from "zustand";

type CartItem = {
  id: string;
  qty: number;
  variant: {
    id: string;
    size: string | null;
    color: string | null;
    stock: number;
    product: {
      name: string;
      slug: string;
      price: number;
      discountPercent: number;
      images: { url: string }[];
    };
  };
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (productVariantId: string, qty: number) => Promise<boolean>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Gagal memuat cart");
      const data = await res.json();
      set({
        items: data.items,
        totalItems: data.totalItems,
        totalPrice: data.totalPrice,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addItem: async (productVariantId, qty) => {
    set({ error: null });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productVariantId, qty }),
      });

      if (!res.ok) {
        // Coba parse sebagai JSON, tapi kalau server balas HTML (misal
        // halaman 404 bawaan Next.js), jangan sampai ikut melempar error
        // yang tidak tertangkap — itu yang bikin loading nyangkut selamanya.
        let message = `Gagal menambahkan ke keranjang (status ${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // response bukan JSON, biarkan pakai pesan default di atas
        }
        set({ error: message });
        return false;
      }

      await get().fetchCart();
      return true;
    } catch (error) {
      // Menangkap error jaringan (misal server mati, atau fetch gagal total).
      // Di-log ke console supaya kelihatan detail errornya saat development,
      // tapi pesan ke user tetap generik & ramah (jangan tampilkan stack trace
      // teknis ke pembeli awam).
      console.error("addItem gagal:", error);
      set({ error: "Tidak bisa terhubung ke server. Coba lagi." });
      return false;
    }
  },

  updateQty: async (itemId, qty) => {
    // Optimistic update: ubah angka di layar duluan sebelum API selesai,
    // supaya terasa instan. Kalau API gagal, kita fetchCart() lagi untuk
    // "membatalkan" perubahan optimis tadi.
    const previousItems = get().items;
    set({
      items: previousItems.map((item) =>
        item.id === itemId ? { ...item, qty } : item
      ),
    });

    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });

    if (!res.ok) {
      set({ items: previousItems }); // rollback
    }
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    const previousItems = get().items;
    set({ items: previousItems.filter((item) => item.id !== itemId) });

    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      set({ items: previousItems });
    }
    await get().fetchCart();
  },
}));