import { NextRequest, NextResponse } from "next/server"
import { devLog } from "@/lib/logger"
import { sendEmail } from "@/lib/sendEmail"
import { generatePortfolioPublishedEmail } from "@/lib/templates/welcomeEmail"
import { withAuth, withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { portfolioPublishSchema } from "@/lib/validators"
import { findPublishedPortfolio, publishPortfolio } from "@/lib/services"

export const POST = withAuth(
  withErrorHandling(
    validateRequest(portfolioPublishSchema)(async (req: NextRequest, ctx) => {
      const { portfolioData, selectedRepos, skills, deployedUrls, userId: rawUserId, userData } = ctx.data
      const userId = rawUserId || ctx.user?.id

      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      }

      const result = await publishPortfolio({
        portfolioData,
        selectedRepos,
        skills,
        deployedUrls,
        userId,
        userData,
      })

      // Send email on every publish (non-blocking)
      devLog(
        "📧 Portfolio published! Email:",
        (result.user as any).email,
        "| isPlaceholder:",
        (result.user as any).email?.includes('@placeholder.com')
      )

      if (!(result.user as any).email?.includes('@placeholder.com')) {
        devLog("🎉 Sending portfolio published email to:", (result.user as any).email)

        const requestUrl = new URL(req.url)
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`

        const publishedEmailHtml = generatePortfolioPublishedEmail({
          name: (result.user as any).name,
          username: (result.user as any).githubUsername || '',
          portfolioUrl: baseUrl,
          customUsername: (result.portfolio as any).customUsername || undefined,
        })

        sendEmail({ to: (result.user as any).email, subject: "🎉 Your Portfolio is Live!", html: publishedEmailHtml }).catch(() => {})
      }

      return NextResponse.json({ success: true, message: "Portfolio published successfully", portfolio: result.portfolio })
    })
  )
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    if (!username && !userId) return NextResponse.json({ error: "Username or User ID is required" }, { status: 400 })

    const portfolio = await findPublishedPortfolio({ username, userId })
    devLog("Found portfolio:", JSON.stringify(portfolio, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2))

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found. Please save at least one section in the dashboard first." },
        { status: 404 }
      )
    }

    const serialized = JSON.parse(JSON.stringify(portfolio, (key, value) => (typeof value === 'bigint' ? value.toString() : value)))
    return NextResponse.json({ success: true, portfolio: serialized })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}
