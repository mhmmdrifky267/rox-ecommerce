// auth.config.ts  (letakkan di ROOT project)
//
// File ini SENGAJA tidak berisi Prisma atau bcrypt, karena file ini
// akan dipakai juga oleh middleware yang berjalan di Edge Runtime.
// Anggap ini "aturan tampilan & redirect", bukan "logika cek password".

import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // provider sesungguhnya (Credentials) didaftarkan di auth.ts
  callbacks: {
    // Callback ini dipakai middleware untuk memutuskan:
    // "apakah user boleh mengakses halaman ini atau harus di-redirect ke /login?"
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isSellerArea = pathname.startsWith("/dashboard");

      // Semua halaman yang menyentuh transaksi/data pribadi wajib login.
      // Katalog produk, homepage, halaman toko TETAP boleh diakses siapa
      // saja tanpa login — supaya orang bisa "window shopping" dulu.
      const isTransactionArea =
        pathname.startsWith("/profile") ||
        pathname.startsWith("/addresses") ||
        pathname.startsWith("/cart") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/orders") ||
        pathname.startsWith("/wishlist");

      if (isSellerArea) {
        // Halaman dashboard seller: wajib login DAN role SELLER
        return isLoggedIn && auth?.user?.role === "SELLER";
      }

      if (isTransactionArea) {
        return isLoggedIn;
      }

      // Halaman lain (katalog, homepage, detail produk, profil toko)
      // boleh diakses siapa saja, termasuk yang belum login.
      return true;
    },
  },
} satisfies NextAuthConfig;