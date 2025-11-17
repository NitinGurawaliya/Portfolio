-- Add soft delete and performance indexes to PortfolioRepository
ALTER TABLE "PortfolioRepository" ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE "PortfolioRepository" ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create index for better query performance
CREATE INDEX "PortfolioRepository_portfolioId_isVisible_idx" ON "PortfolioRepository"("portfolioId", "isVisible");

-- Create composite index on DailyProjectViews for faster lookups
CREATE INDEX "DailyProjectViews_portfolioId_projectId_idx" ON "DailyProjectViews"("portfolioId", "projectId");

-- Create function to automatically cleanup orphaned analytics data
CREATE OR REPLACE FUNCTION cleanup_orphaned_analytics()
RETURNS void AS $$
BEGIN
  -- Delete DailyProjectViews entries where PortfolioRepository no longer exists
  DELETE FROM "DailyProjectViews"
  WHERE NOT EXISTS (
    SELECT 1 FROM "PortfolioRepository" pr 
    WHERE pr.id = "DailyProjectViews"."projectId"
  );
  
  -- Delete ProjectClick entries where PortfolioRepository no longer exists
  DELETE FROM "ProjectClick"
  WHERE NOT EXISTS (
    SELECT 1 FROM "PortfolioRepository" pr 
    WHERE pr.id = "ProjectClick"."projectId"
  );
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically cleanup orphaned data when PortfolioRepository is deleted
CREATE OR REPLACE FUNCTION trigger_cleanup_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete analytics for the deleted PortfolioRepository
  DELETE FROM "DailyProjectViews"
  WHERE "projectId" = OLD.id;
  
  DELETE FROM "ProjectClick"
  WHERE "projectId" = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_analytics_on_delete
AFTER DELETE ON "PortfolioRepository"
FOR EACH ROW
EXECUTE FUNCTION trigger_cleanup_analytics();

-- Add comment explaining the cleanup strategy
COMMENT ON FUNCTION cleanup_orphaned_analytics() IS 
'Removes analytics data for non-existent PortfolioRepository entries to maintain data integrity';

COMMENT ON FUNCTION trigger_cleanup_analytics() IS 
'Automatically removes analytics data when a PortfolioRepository is deleted';

