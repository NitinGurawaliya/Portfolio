import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Get all stats in parallel
    const [totalUsers, totalProjects, totalPortfolios, totalProfileVisits] =
      await Promise.all([
        // Total users
        prisma.user.count(),
        // Total projects (PortfolioRepository entries that are visible and not deleted)
        prisma.portfolioRepository.count({
          where: {
            isVisible: true,
            deletedAt: null,
          },
        }),
        // Total published portfolios
        prisma.portfolio.count({
          where: {
            isPublished: true,
          },
        }),
        // Total profile visits (sum of all PortfolioAnalytics totalViews)
        prisma.portfolioAnalytics.aggregate({
          _sum: {
            totalViews: true,
          },
        }),
      ])

    return NextResponse.json({
      users: totalUsers,
      projects: totalProjects,
      portfolios: totalPortfolios,
      profileVisits: totalProfileVisits._sum.totalViews || 0,
    })
  } catch (error) {
    console.error("❌ Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

