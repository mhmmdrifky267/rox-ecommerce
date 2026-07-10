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
      const isAccountArea =
        pathname.startsWith("/profile") || pathname.startsWith("/addresses");

      if (isSellerArea) {
        // Halaman dashboard seller: wajib login DAN role SELLER
        return isLoggedIn && auth?.user?.role === "SELLER";
      }

      if (isAccountArea) {
        // Halaman akun: wajib login, role apa saja boleh
        return isLoggedIn;
      }

      // Halaman lain (katalog, homepage, dll) boleh diakses siapa saja
      return true;
    },
  },
} satisfies NextAuthConfig;