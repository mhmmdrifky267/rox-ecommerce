-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "discountPercent" INTEGER NOT NULL DEFAULT 0;
