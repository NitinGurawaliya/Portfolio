-- CreateIndex
CREATE INDEX IF NOT EXISTS "Portfolio_customUsername_idx" ON "Portfolio"("customUsername");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Portfolio_isPublished_idx" ON "Portfolio"("isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Portfolio_customUsername_isPublished_idx" ON "Portfolio"("customUsername", "isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_githubUsername_idx" ON "User"("githubUsername");

