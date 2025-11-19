import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            githubUsername: true,
            avatarUrl: true,
          },
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
    })

    const formattedPortfolios = portfolios
      .map((portfolio) => {
        const username =
          portfolio.customUsername ||
          portfolio.user?.githubUsername ||
          `user-${portfolio.id}`

        return {
          id: portfolio.id,
          username,
          displayName: portfolio.displayName || username,
          profilePic: portfolio.profilePic ?? portfolio.user?.avatarUrl ?? null,
          projectsCount: portfolio.repositories.length,
          portfolioUrl: `/${username}`,
        }
      })
      .filter((portfolio) => portfolio.projectsCount > 0)

    return NextResponse.json({ portfolios: formattedPortfolios })
  } catch (error) {
    console.error("❌ Error fetching wall of fame portfolios:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolios" },
      { status: 500 }
    )
  }
}

