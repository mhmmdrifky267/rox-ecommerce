// app/api/seller/profile/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateSellerProfile, getSellerProfile } from "@/services/product.service";

const storeProfileSchema = z.object({
  storeName: z.string().min(2),
  description: z.string().optional(),
  storeAddress: z.string().min(10, "Alamat lengkap wajib diisi"),
  storeCity: z.string().min(2, "Kota wajib diisi"),
  storePostalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit angka"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const seller = await getSellerProfile(session.user.sellerId);
  return NextResponse.json(seller);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER" || !session.user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = storeProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const seller = await updateSellerProfile(session.user.sellerId, parsed.data);
  return NextResponse.json(seller);
}