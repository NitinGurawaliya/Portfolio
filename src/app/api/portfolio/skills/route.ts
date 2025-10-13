import { NextRequest, NextResponse } from "next/server"
import { withAuth, withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { portfolioSkillsSchema } from "@/lib/validators"
import { saveSkills } from "@/lib/services"

export const POST = withAuth(
  withErrorHandling(
    validateRequest(portfolioSkillsSchema)(async (_req: NextRequest, ctx) => {
      const { userId: rawUserId, userData, skills } = ctx.data
      const userId = rawUserId || ctx.user?.id
      if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      const result = await saveSkills({ userId, userData, skills })
      return NextResponse.json({ success: true, message: "Skills saved successfully", data: result })
    })
  )
)
