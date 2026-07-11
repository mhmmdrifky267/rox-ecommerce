// services/order.service.ts

import { prisma } from "@/lib/prisma";
import { getCartGroupedBySeller } from "./cart.service";

type ShipmentSelection = {
  sellerId: string;
  courierName: string;
  courierService: string;
  shippingCost: number;
};

// Dipanggil saat user klik "Bayar Sekarang". Untuk setiap toko di cart yang
// sudah dipilih kurirnya, buat satu Order + OrderItems, kurangi stok, dan
// hapus item itu dari cart. Dibungkus $transaction supaya atomik — kalau
// satu langkah gagal (misal stok berubah di tengah jalan), semua dibatalkan.
export async function createOrdersFromCart(
  userId: string,
  addressId: string,
  shipments: ShipmentSelection[]
) {
  const groups = await getCartGroupedBySeller(userId);

  const orders = await prisma.$transaction(async (tx) => {
    const createdOrders = [];

    for (const shipment of shipments) {
      const group = groups.find((g) => g.sellerId === shipment.sellerId);
      if (!group || group.items.length === 0) continue;

      // Validasi ulang stok di dalam transaksi — mencegah race condition
      // kalau ada pembeli lain checkout produk yang sama di waktu bersamaan.
      for (const item of group.items) {
        if (item.qty > item.variant.stock) {
          throw new Error(
            `Stok "${item.variant.product.name}" tidak lagi mencukupi`
          );
        }
      }

      const totalPrice = group.itemsTotal + shipment.shippingCost;

      const order = await tx.order.create({
        data: {
          userId,
          sellerId: shipment.sellerId,
          addressId,
          itemsTotal: group.itemsTotal,
          shippingCost: shipment.shippingCost,
          totalPrice,
          courierName: shipment.courierName,
          courierService: shipment.courierService,
          items: {
            create: group.items.map((item) => ({
              productVariantId: item.productVariantId,
              qty: item.qty,
              priceAtOrder: item.variant.product.price,
            })),
          },
        },
        include: { items: true },
      });

      // Kurangi stok tiap varian yang dibeli
      for (const item of group.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Hapus item-item toko ini dari cart (checkout selesai untuk toko ini)
      await tx.cartItem.deleteMany({
        where: { id: { in: group.items.map((i) => i.id) } },
      });

      createdOrders.push(order);
    }

    return createdOrders;
  });

  return orders;
}

export async function getOrderById(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      address: true,
      seller: { select: { storeName: true } },
      payment: true,
    },
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            },
          },
        },
      },
      seller: { select: { storeName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}