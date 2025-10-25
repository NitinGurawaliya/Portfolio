-- CreateTable
CREATE TABLE "ProjectView" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "projectId" BIGINT NOT NULL,
    "projectName" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "ProjectView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectView_portfolioId_idx" ON "ProjectView"("portfolioId");

-- CreateIndex
CREATE INDEX "ProjectView_projectId_idx" ON "ProjectView"("projectId");

-- CreateIndex
CREATE INDEX "ProjectView_viewedAt_idx" ON "ProjectView"("viewedAt");

-- CreateTable
CREATE TABLE "DailyProjectViews" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "projectId" BIGINT NOT NULL,
    "projectName" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyProjectViews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyProjectViews_portfolioId_projectId_date_key" ON "DailyProjectViews"("portfolioId", "projectId", "date");

-- CreateIndex
CREATE INDEX "DailyProjectViews_portfolioId_idx" ON "DailyProjectViews"("portfolioId");

-- CreateIndex
CREATE INDEX "DailyProjectViews_projectId_idx" ON "DailyProjectViews"("projectId");

-- CreateIndex
CREATE INDEX "DailyProjectViews_date_idx" ON "DailyProjectViews"("date");
