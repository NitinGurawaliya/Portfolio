/*
  Warnings:

  - You are about to drop the column `githubUrl` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUrl` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `Portfolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Portfolio" DROP COLUMN "githubUrl",
DROP COLUMN "instagramUrl",
DROP COLUMN "linkedinUrl",
DROP COLUMN "twitterUrl";

-- CreateTable
CREATE TABLE "public"."Social" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "url" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Social_portfolioId_platform_key" ON "public"."Social"("portfolioId", "platform");

-- AddForeignKey
ALTER TABLE "public"."Social" ADD CONSTRAINT "Social_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
