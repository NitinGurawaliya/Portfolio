import { NextRequest, NextResponse } from "next/server"
import { withAuth, withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { portfolioHomeSchema } from "@/lib/validators"
import { updateHomeSection } from "@/lib/services"

export const POST = withAuth(
  withErrorHandling(
    validateRequest(portfolioHomeSchema)(async (_req: NextRequest, ctx) => {
      const { userId: rawUserId, userData, portfolioData } = ctx.data
      const userId = rawUserId || ctx.user?.id
      if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      const result = await updateHomeSection({ userId, userData, portfolioData })
      return NextResponse.json({ success: true, message: "Home section saved successfully", portfolio: result })
    })
  )
)
