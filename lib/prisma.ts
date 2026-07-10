// src/lib/prisma.ts
//
// Kenapa perlu "adapter" sekarang?
// Prisma 7 melepas ketergantungan pada engine Rust bawaan, jadi kita harus
// menyambungkan Prisma ke database via driver Node.js biasa (dalam hal ini "pg").
// Ini justru membuat aplikasi lebih ringan saat di-deploy.
//
// Pola "globalForPrisma" di bawah mencegah Next.js membuat koneksi baru
// setiap kali hot-reload terjadi saat development (kalau tidak dicegah,
// bisa kehabisan koneksi database dengan cepat).

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}