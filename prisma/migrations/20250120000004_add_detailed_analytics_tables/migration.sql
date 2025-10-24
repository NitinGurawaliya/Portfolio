-- CreateTable
CREATE TABLE "ProjectClick" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "projectName" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "ProjectClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialClick" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "socialType" TEXT NOT NULL,
    "socialUrl" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "SocialClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSession" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "PortfolioSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectClick_portfolioId_idx" ON "ProjectClick"("portfolioId");

-- CreateIndex
CREATE INDEX "ProjectClick_projectId_idx" ON "ProjectClick"("projectId");

-- CreateIndex
CREATE INDEX "ProjectClick_clickedAt_idx" ON "ProjectClick"("clickedAt");

-- CreateIndex
CREATE INDEX "SocialClick_portfolioId_idx" ON "SocialClick"("portfolioId");

-- CreateIndex
CREATE INDEX "SocialClick_socialType_idx" ON "SocialClick"("socialType");

-- CreateIndex
CREATE INDEX "SocialClick_clickedAt_idx" ON "SocialClick"("clickedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSession_sessionId_key" ON "PortfolioSession"("sessionId");

-- CreateIndex
CREATE INDEX "PortfolioSession_portfolioId_idx" ON "PortfolioSession"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioSession_sessionId_idx" ON "PortfolioSession"("sessionId");

-- CreateIndex
CREATE INDEX "PortfolioSession_startTime_idx" ON "PortfolioSession"("startTime");
