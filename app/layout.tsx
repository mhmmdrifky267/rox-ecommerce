// app/layout.tsx

import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AuthProvider } from "@/components/providers/AuthProvider";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-archivo",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "R.O.X.",
  description: "Belanja fashion favoritmu di R.O.X.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        archivo.variable,
        inter.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}