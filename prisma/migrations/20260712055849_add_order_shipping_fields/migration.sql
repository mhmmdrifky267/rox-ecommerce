/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `product_views` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "product_views_userId_viewedAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "product_views_userId_productId_key" ON "product_views"("userId", "productId");
