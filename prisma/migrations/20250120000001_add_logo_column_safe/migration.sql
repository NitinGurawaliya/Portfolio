-- AlterTable
-- Safely add logo column only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Repository' 
        AND column_name = 'logo'
    ) THEN
        ALTER TABLE "Repository" ADD COLUMN "logo" TEXT;
    END IF;
END $$;
