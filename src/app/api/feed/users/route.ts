import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

    const page = Math.max(parseInt(pageParam ?? "1", 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(limitParam ?? "10", 10) || 10, 1), 50)
    const skip = (page - 1) * pageSize

    // Get published portfolios with user info
    const portfolios = await prisma.portfolio.findMany({
      where: {
        isPublished: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
        skills: {
          select: {
            id: true,
            name: true,
            category: true,
          },
          take: 10, // Limit skills for feed
        },
        repositories: {
          where: {
            isVisible: true,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: pageSize,
    })

    // Get portfolio views for each portfolio
    const portfolioIds = portfolios.map((p) => p.id)
    const viewsMap = new Map<number, number>()

    if (portfolioIds.length > 0) {
      const analytics = await prisma.portfolioAnalytics.findMany({
        where: {
          portfolioId: { in: portfolioIds },
        },
        select: {
          portfolioId: true,
          totalViews: true,
        },
      })

      analytics.forEach((a) => {
        viewsMap.set(a.portfolioId, a.totalViews || 0)
      })
    }

    const users = portfolios.map((portfolio) => {
      const username =
        portfolio.customUsername ||
        portfolio.user?.githubUsername ||
        `user-${portfolio.id}`

      return {
        id: portfolio.id,
        username,
        name: portfolio.displayName || portfolio.user?.name || username,
        profilePic: portfolio.profilePic || portfolio.user?.avatarUrl || null,
        bio: portfolio.bio || null,
        skills: portfolio.skills.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
        })),
        profileViews: viewsMap.get(portfolio.id) || 0,
        projectsCount: portfolio.repositories.length,
        portfolioUrl: `/${username}`,
      }
    })

    // Check if there are more pages
    const totalCount = await prisma.portfolio.count({
      where: {
        isPublished: true,
      },
    })

    const hasMore = skip + portfolios.length < totalCount

    return NextResponse.json({
      users,
      page,
      hasMore,
      total: totalCount,
    })
  } catch (error) {
    console.error("❌ Error fetching users feed:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

