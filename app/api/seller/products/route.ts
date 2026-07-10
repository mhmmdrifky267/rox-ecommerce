// app/api/seller/products/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { productSchema } from "@/lib/validations/product";
import {
  createProduct,
  getSellerProducts,
} from "@/services/product.service";

// Helper kecil dipakai berulang di semua route seller — cek sesi & role
async function requireSeller() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER") {
    return null;
  }
  return session.user;
}

export async function GET() {
  const user = await requireSeller();
  if (!user || !user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const products = await getSellerProducts(user.sellerId);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const user = await requireSeller();
  if (!user || !user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const product = await createProduct(user.sellerId, parsed.data);
  return NextResponse.json(product, { status: 201 });
}