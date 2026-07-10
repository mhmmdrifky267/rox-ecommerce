// app/api/seller/products/[id]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { productSchema } from "@/lib/validations/product";
import { updateProduct, deleteProduct } from "@/services/product.service";

async function requireSeller() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER") {
    return null;
  }
  return session.user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSeller();
  if (!user || !user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params; // di Next.js versi baru, params adalah Promise

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const product = await updateProduct(id, user.sellerId, parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 403 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSeller();
  if (!user || !user.sellerId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteProduct(id, user.sellerId);
    return NextResponse.json({ message: "Produk dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 403 }
    );
  }
}