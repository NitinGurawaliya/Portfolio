-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "verificationToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");
CREATE UNIQUE INDEX "CustomDomain_portfolioId_key" ON "CustomDomain"("portfolioId");
CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");
CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");
CREATE INDEX "CustomDomain_verified_idx" ON "CustomDomain"("verified");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
