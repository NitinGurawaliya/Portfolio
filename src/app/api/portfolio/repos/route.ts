import { NextRequest, NextResponse } from "next/server"
import { withAuth, withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { portfolioReposSchema } from "@/lib/validators"
import { savePortfolioRepos } from "@/lib/services"

export const POST = withAuth(
  withErrorHandling(
    validateRequest(portfolioReposSchema)(async (_req: NextRequest, ctx) => {
      const { userId: rawUserId, userData, repositories, selectedRepos, deployedUrls } = ctx.data
      const userId = rawUserId || ctx.user?.id
      if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      const result = await savePortfolioRepos({ userId, userData, repositories, selectedRepos, deployedUrls })
      return NextResponse.json({ success: true, message: "Repositories saved successfully", data: result })
    })
  )
)