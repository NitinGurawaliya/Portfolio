import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Get top 5 portfolios with most views from PortfolioAnalytics
    const topAnalytics = await prisma.portfolioAnalytics.findMany({
      orderBy: {
        totalViews: "desc",
      },
      take: 10, // Get more to filter out invalid ones
    })

    // Get portfolio IDs
    const portfolioIds = topAnalytics.map((analytics) => analytics.portfolioId)

    // Fetch portfolios with user data
    const portfolios = await prisma.portfolio.findMany({
      where: {
        id: { in: portfolioIds },
        isPublished: true,
        profilePic: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            githubUsername: true,
          },
        },
      },
    })

    // Create a map of portfolioId to analytics
    const analyticsMap = new Map(
      topAnalytics.map((analytics) => [analytics.portfolioId, analytics])
    )

    // Combine and sort by views
    const validPortfolios = portfolios
      .map((portfolio) => ({
        portfolio,
        analytics: analyticsMap.get(portfolio.id),
      }))
      .filter((item) => item.analytics && item.portfolio.user)
      .sort((a, b) => (b.analytics?.totalViews || 0) - (a.analytics?.totalViews || 0))
      .slice(0, 5)

    const topUsers = validPortfolios.map((item) => ({
      id: item.portfolio.user.id,
      name: item.portfolio.user.name || item.portfolio.displayName || "Developer",
      avatarUrl: item.portfolio.profilePic || item.portfolio.user.avatarUrl,
      username: item.portfolio.customUsername || item.portfolio.user.githubUsername,
      views: item.analytics?.totalViews || 0,
    }))

    return NextResponse.json({ users: topUsers })
  } catch (error) {
    console.error("❌ Error fetching top users:", error)
    return NextResponse.json(
      { error: "Failed to fetch top users" },
      { status: 500 }
    )
  }
}

