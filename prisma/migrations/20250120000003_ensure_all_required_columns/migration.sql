-- Comprehensive migration to ensure all required columns exist
-- This prevents production deployment issues by ensuring database completeness

DO $$ 
BEGIN
    -- Ensure Repository table has all required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Repository' 
        AND column_name = 'favicon'
    ) THEN
        ALTER TABLE "Repository" ADD COLUMN "favicon" TEXT;
        RAISE NOTICE 'Added favicon column to Repository table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Repository' 
        AND column_name = 'logo'
    ) THEN
        ALTER TABLE "Repository" ADD COLUMN "logo" TEXT;
        RAISE NOTICE 'Added logo column to Repository table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Repository' 
        AND column_name = 'githubUrl'
    ) THEN
        ALTER TABLE "Repository" ADD COLUMN "githubUrl" TEXT;
        RAISE NOTICE 'Added githubUrl column to Repository table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Repository' 
        AND column_name = 'isImported'
    ) THEN
        ALTER TABLE "Repository" ADD COLUMN "isImported" BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added isImported column to Repository table';
    END IF;

    -- Ensure PortfolioRepository table has all required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'customName'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "customName" TEXT;
        RAISE NOTICE 'Added customName column to PortfolioRepository table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'customDescription'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "customDescription" TEXT;
        RAISE NOTICE 'Added customDescription column to PortfolioRepository table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'technologies'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "technologies" TEXT;
        RAISE NOTICE 'Added technologies column to PortfolioRepository table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'displayOrder'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "displayOrder" INTEGER;
        RAISE NOTICE 'Added displayOrder column to PortfolioRepository table';
    END IF;

    -- Ensure analytics tables exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioView'
    ) THEN
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
        
        CREATE INDEX "PortfolioView_portfolioId_idx" ON "PortfolioView"("portfolioId");
        CREATE INDEX "PortfolioView_userId_idx" ON "PortfolioView"("userId");
        CREATE INDEX "PortfolioView_viewedAt_idx" ON "PortfolioView"("viewedAt");
        
        RAISE NOTICE 'Created PortfolioView table with indexes';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioAnalytics'
    ) THEN
        CREATE TABLE "PortfolioAnalytics" (
            "id" SERIAL NOT NULL,
            "portfolioId" INTEGER NOT NULL,
            "totalViews" INTEGER NOT NULL DEFAULT 0,
            "lastViewedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PortfolioAnalytics_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX "PortfolioAnalytics_portfolioId_key" ON "PortfolioAnalytics"("portfolioId");
        CREATE INDEX "PortfolioAnalytics_portfolioId_idx" ON "PortfolioAnalytics"("portfolioId");
        
        RAISE NOTICE 'Created PortfolioAnalytics table with indexes';
    END IF;

    RAISE NOTICE 'Database schema validation and completion completed successfully';
END $$;
