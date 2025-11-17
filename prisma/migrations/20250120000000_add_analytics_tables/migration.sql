-- CreatePortfolioView
CREATE TABLE "PortfolioView" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "PortfolioView_pkey" PRIMARY KEY ("id")
);

-- CreatePortfolioAnalytics
CREATE TABLE "PortfolioAnalytics" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioView_portfolioId_idx" ON "PortfolioView"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioView_userId_idx" ON "PortfolioView"("userId");

-- CreateIndex
CREATE INDEX "PortfolioView_viewedAt_idx" ON "PortfolioView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioAnalytics_portfolioId_key" ON "PortfolioAnalytics"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioAnalytics_portfolioId_idx" ON "PortfolioAnalytics"("portfolioId");
