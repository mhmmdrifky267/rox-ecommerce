// services/recommendation.service.ts

import { prisma } from "@/lib/prisma";

// Dipanggil setiap kali user membuka halaman detail produk.
// upsert supaya "dilihat lagi" cuma update timestamp, bukan bikin baris baru.
export async function trackProductView(userId: string, productId: string) {
  await prisma.productView.upsert({
    where: { userId_productId: { userId, productId } },
    update: { viewedAt: new Date() },
    create: { userId, productId },
  });
}

export async function getRecentlyViewed(
  userId: string,
  excludeProductId?: string,
  limit = 8
) {
  const views = await prisma.productView.findMany({
    where: {
      userId,
      ...(excludeProductId && { productId: { not: excludeProductId } }),
      product: { isActive: true },
    },
    orderBy: { viewedAt: "desc" },
    take: limit,
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });

  return views.map((v) => v.product);
}

// "Pelanggan yang membeli produk ini juga membeli..."
// Caranya: cari semua Order yang mengandung productId ini, lalu cari
// produk-produk LAIN yang muncul di Order-Order yang sama, urutkan
// berdasarkan seberapa sering muncul bersama.
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit = 4
) {
  // 1. Cari semua orderId yang mengandung produk ini
  const ordersWithProduct = await prisma.orderItem.findMany({
    where: { variant: { productId } },
    select: { orderId: true },
    distinct: ["orderId"],
  });
  const orderIds = ordersWithProduct.map((o) => o.orderId);

  if (orderIds.length === 0) return [];

  // 2. Cari item lain (produk BEDA) di order-order yang sama
  const otherItems = await prisma.orderItem.findMany({
    where: {
      orderId: { in: orderIds },
      variant: { productId: { not: productId } },
    },
    select: { variant: { select: { productId: true } } },
  });

  // 3. Hitung frekuensi kemunculan tiap productId
  const frequency = new Map<string, number>();
  for (const item of otherItems) {
    const id = item.variant.productId;
    frequency.set(id, (frequency.get(id) ?? 0) + 1);
  }

  const topProductIds = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topProductIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds }, isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  // findMany tidak menjamin urutan sesuai topProductIds, jadi kita urutkan manual
  return topProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
}

// Produk terlaris — dihitung dari total qty yang pernah terjual.
// Kalau belum ada penjualan sama sekali (project baru), fallback ke produk terbaru.
export async function getPopularProducts(limit = 8) {
  const soldGroups = await prisma.orderItem.groupBy({
    by: ["productVariantId"],
    _sum: { qty: true },
  });

  if (soldGroups.length === 0) {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });
  }

  // productVariantId -> productId (butuh lookup karena groupBy di atas per varian)
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: soldGroups.map((g) => g.productVariantId) } },
    select: { id: true, productId: true },
  });
  const variantToProduct = new Map(variants.map((v) => [v.id, v.productId]));

  const productSales = new Map<string, number>();
  for (const group of soldGroups) {
    const productId = variantToProduct.get(group.productVariantId);
    if (!productId) continue;
    productSales.set(
      productId,
      (productSales.get(productId) ?? 0) + (group._sum.qty ?? 0)
    );
  }

  const topProductIds = Array.from(productSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds }, isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  return topProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
}