// auth.ts  (letakkan di ROOT project, sejajar dengan auth.config.ts)
//
// Ini adalah "otak" auth kita: tempat provider Credentials benar-benar
// mengecek email & password ke database. File ini HANYA dipakai di server
// (Route Handler, Server Component, Server Action) — tidak pernah di middleware.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" }, // JWT dipilih karena lebih ringan, tidak perlu tabel Session
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        // 1. Validasi bentuk data dulu
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Cari user berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email },
          include: { seller: true },
        });

        // Kalau user tidak ada, atau daftar via Google (password null), tolak
        if (!user || !user.password) return null;

        // 3. Bandingkan password yang diketik dengan hash di database
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return null;

        // 4. Kembalikan data yang nanti disimpan di token/session
        //    JANGAN kembalikan field password!
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          sellerId: user.seller?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Data dari authorize() di atas masuk ke JWT lewat callback ini
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sellerId = user.sellerId;
      }
      return token;
    },
    // Lalu dari JWT, data disalurkan ke object session yang dipakai di client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "BUYER" | "SELLER" | "ADMIN";
        session.user.sellerId = token.sellerId as string | null;
      }
      return session;
    },
  },
});