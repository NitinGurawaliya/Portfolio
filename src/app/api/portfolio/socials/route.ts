import { NextRequest, NextResponse } from "next/server"
import { withAuth, withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { portfolioSocialsSchema } from "@/lib/validators"
import { saveSocials } from "@/lib/services"

export const POST = withAuth(
  withErrorHandling(
    validateRequest(portfolioSocialsSchema)(async (_req: NextRequest, ctx) => {
      const { userId: rawUserId, userData, socials } = ctx.data
      const userId = rawUserId || ctx.user?.id
      if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      const result = await saveSocials({ userId, userData, socials })
      return NextResponse.json({ success: true, message: "Social accounts saved successfully", portfolio: result })
    })
  )
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // keep simple for now; can be moved to service if needed
    const { prisma } = await import("@/lib/prisma")
    const portfolio = await prisma.portfolio.findFirst({ where: { user: { githubId: userId } }, include: { socials: true } })

    return NextResponse.json({
      success: true,
      socials: portfolio?.socials || []
    })

  } catch (error) {
    console.error("Error fetching social accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch social accounts" },
      { status: 500 }
    )
  } finally {
    // Do not disconnect global prisma; connection is managed centrally
  }
}
