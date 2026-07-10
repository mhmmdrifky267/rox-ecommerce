// types/next-auth.d.ts
//
// Secara default, TypeScript tidak tahu bahwa kita menambahkan field
// "role" dan "sellerId" ke dalam session. File ini "memperluas" (extend)
// tipe bawaan next-auth supaya TypeScript tidak komplain / merah.

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "BUYER" | "SELLER" | "ADMIN";
      sellerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "BUYER" | "SELLER" | "ADMIN";
    sellerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "BUYER" | "SELLER" | "ADMIN";
    sellerId: string | null;
  }
}