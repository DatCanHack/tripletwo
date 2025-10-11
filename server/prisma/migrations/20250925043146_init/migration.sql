/*
  Warnings:

  - Changed the type of `category` on the `Program` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FATLOSS', 'STRENGTH', 'YOGA');

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;

-- CreateIndex
CREATE INDEX "Program_category_idx" ON "Program"("category");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
