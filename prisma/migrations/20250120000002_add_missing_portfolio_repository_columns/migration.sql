-- Add missing columns to PortfolioRepository table
-- Safely add columns only if they don't exist

DO $$ 
BEGIN
    -- Add customName column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'customName'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "customName" TEXT;
    END IF;

    -- Add customDescription column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'customDescription'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "customDescription" TEXT;
    END IF;

    -- Add technologies column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioRepository' 
        AND column_name = 'technologies'
    ) THEN
        ALTER TABLE "PortfolioRepository" ADD COLUMN "technologies" TEXT;
    END IF;
END $$;
