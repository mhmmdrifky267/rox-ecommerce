/*
  Warnings:

  - Added the required column `itemsTotal` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "courierName" TEXT,
ADD COLUMN     "courierService" TEXT,
ADD COLUMN     "itemsTotal" INTEGER NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ADD COLUMN     "shippingCost" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
