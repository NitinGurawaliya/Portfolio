-- CreateEnum
CREATE TYPE "ShiplogReactionType" AS ENUM ('SHIPPED', 'FIXED', 'SUPPORT');

-- CreateTable
CREATE TABLE "Shiplog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "portfolioRepositoryId" INTEGER,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shiplog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiplogReaction" (
    "id" SERIAL NOT NULL,
    "shiplogId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ShiplogReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiplogReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" SERIAL NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shiplog_userId_idx" ON "Shiplog"("userId");
CREATE INDEX "Shiplog_portfolioRepositoryId_idx" ON "Shiplog"("portfolioRepositoryId");
CREATE INDEX "Shiplog_createdAt_idx" ON "Shiplog"("createdAt");
CREATE UNIQUE INDEX "ShiplogReaction_shiplogId_userId_key" ON "ShiplogReaction"("shiplogId", "userId");
CREATE INDEX "ShiplogReaction_shiplogId_idx" ON "ShiplogReaction"("shiplogId");
CREATE INDEX "ShiplogReaction_userId_idx" ON "ShiplogReaction"("userId");
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");
CREATE INDEX "UserFollow_followerId_idx" ON "UserFollow"("followerId");
CREATE INDEX "UserFollow_followingId_idx" ON "UserFollow"("followingId");

-- AddForeignKey
ALTER TABLE "Shiplog" ADD CONSTRAINT "Shiplog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shiplog" ADD CONSTRAINT "Shiplog_portfolioRepositoryId_fkey" FOREIGN KEY ("portfolioRepositoryId") REFERENCES "PortfolioRepository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShiplogReaction" ADD CONSTRAINT "ShiplogReaction_shiplogId_fkey" FOREIGN KEY ("shiplogId") REFERENCES "Shiplog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiplogReaction" ADD CONSTRAINT "ShiplogReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
