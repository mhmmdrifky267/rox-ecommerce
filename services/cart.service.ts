// services/cart.service.ts

import { prisma } from "@/lib/prisma";
import { getEffectivePrice } from "@/lib/pricing";

// Setiap user seharusnya sudah punya Cart sejak register (lihat route
// register kita di Tahap 2). Fungsi ini jaga-jaga kalau ternyata belum ada.
async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

export async function getCartWithDetails(userId: string) {
  const cart = await getOrCreateCart(userId);

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              seller: { select: { id: true, storeName: true } },
            },
          },
        },
      },
    },
  });

  const totalPrice = items.reduce(
    (sum, item) =>
      sum +
      item.qty *
        getEffectivePrice(item.variant.product.price, item.variant.product.discountPercent),
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return { items, totalPrice, totalItems };
}

export async function addToCart(
  userId: string,
  productVariantId: string,
  qty: number
) {
  const cart = await getOrCreateCart(userId);

  // Validasi stok dulu sebelum menambah — jangan sampai cart menyimpan
  // qty lebih banyak dari stok yang benar-benar tersedia.
  const variant = await prisma.productVariant.findUnique({
    where: { id: productVariantId },
  });
  if (!variant) throw new Error("Varian produk tidak ditemukan");

  // Kalau item ini sudah ada di cart, tambahkan qty-nya (bukan duplikat baris).
  // Ini sebabnya kita kasih @@unique([cartId, productVariantId]) di schema dulu.
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productVariantId: {
        cartId: cart.id,
        productVariantId,
      },
    },
  });

  const newQty = (existingItem?.qty ?? 0) + qty;
  if (newQty > variant.stock) {
    throw new Error(`Stok tidak cukup. Tersisa ${variant.stock}`);
  }

  return prisma.cartItem.upsert({
    where: {
      cartId_productVariantId: { cartId: cart.id, productVariantId },
    },
    update: { qty: newQty },
    create: { cartId: cart.id, productVariantId, qty },
  });
}

export async function updateCartItemQty(
  userId: string,
  itemId: string,
  qty: number
) {
  const cart = await getOrCreateCart(userId);

  // Pastikan item ini benar-benar milik cart user yang sedang request
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { variant: true },
  });
  if (!item) throw new Error("Item tidak ditemukan di cart kamu");

  if (qty > item.variant.stock) {
    throw new Error(`Stok tidak cukup. Tersisa ${item.variant.stock}`);
  }

  if (qty <= 0) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  return prisma.cartItem.update({ where: { id: itemId }, data: { qty } });
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) throw new Error("Item tidak ditemukan di cart kamu");

  return prisma.cartItem.delete({ where: { id: itemId } });
}

// Dikelompokkan per toko — dipakai khusus di halaman checkout, karena
// ongkir dan Order dihitung per toko (lihat penjelasan Tahap 7), bukan
// sekali untuk seluruh cart.
export async function getCartGroupedBySeller(userId: string) {
  const { items } = await getCartWithDetails(userId);

  const groups = new Map<
    string,
    {
      sellerId: string;
      storeName: string;
      items: typeof items;
      itemsTotal: number;
      totalWeight: number;
    }
  >();

  for (const item of items) {
    const sellerId = item.variant.product.sellerId;

    if (!groups.has(sellerId)) {
      groups.set(sellerId, {
        sellerId,
        storeName: item.variant.product.seller.storeName,
        items: [],
        itemsTotal: 0,
        totalWeight: 0,
      });
    }

    const group = groups.get(sellerId)!;
    group.items.push(item);
    group.itemsTotal +=
      getEffectivePrice(item.variant.product.price, item.variant.product.discountPercent) *
      item.qty;
    group.totalWeight += item.variant.product.weight * item.qty;
  }

  return Array.from(groups.values());
}