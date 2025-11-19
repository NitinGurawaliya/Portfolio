import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface CommunityPortfolio {
  id: number
  username: string
  displayName: string
  profilePic?: string | null
  projectsCount: number
  portfolioUrl: string
}

const fetchCommunityPortfolios = unstable_cache(
  async (): Promise<CommunityPortfolio[]> => {
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

    return portfolios
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
  },
  ["wall-of-fame-community-portfolios"],
  { revalidate: 60 } // 60 seconds = 1 minute for fresh data
)

export async function getWallOfFamePortfolios() {
  return fetchCommunityPortfolios()
}

