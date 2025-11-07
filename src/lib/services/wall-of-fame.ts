import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

interface FeaturedPortfolio {
  id: number
  username: string
  displayName: string
  jobTitle?: string | null
  bio?: string | null
  profilePic?: string | null
  selectedTheme: string
  skills: Array<{
    name: string
    category: string | null
  }>
  repositories: Array<{
    name: string
    language: string | null
    stargazersCount: number
  }>
  updatedAt: string
  portfolioUrl: string
  totalViews: number
}

const DEFAULT_LIMIT = 3

const fetchTopWallOfFamePortfolios = unstable_cache(
  async (limit: number = DEFAULT_LIMIT): Promise<FeaturedPortfolio[]> => {
    const safeLimit = Math.max(1, Math.min(limit, DEFAULT_LIMIT))

    const analyticsLeaders = await prisma.portfolioAnalytics.findMany({
      orderBy: { totalViews: "desc" },
      take: safeLimit,
      select: {
        portfolioId: true,
        totalViews: true,
      },
    })

    if (!analyticsLeaders.length) {
      return []
    }

    const portfolioIds = analyticsLeaders.map((entry) => entry.portfolioId)
    const analyticsByPortfolio = new Map(
      analyticsLeaders.map((entry) => [entry.portfolioId, entry.totalViews])
    )

    const basePortfolioWhere = {
      isPublished: true,
      displayName: { not: null },
      profilePic: { not: null },
      customUsername: { not: null },
    } as const

    const basePortfolioInclude = {
      user: {
        select: {
          githubUsername: true,
          avatarUrl: true,
        },
      },
      skills: {
        select: {
          name: true,
          category: true,
        },
        take: 6,
      },
      repositories: {
        where: { isVisible: true },
        select: {
          repository: {
            select: {
              name: true,
              language: true,
              stargazersCount: true,
            },
          },
        },
        take: 3,
      },
    } as const

    const portfolios = await prisma.portfolio.findMany({
      where: {
        ...basePortfolioWhere,
        id: { in: portfolioIds },
      },
      include: basePortfolioInclude,
    })

    const portfolioMap = new Map(portfolios.map((item) => [item.id, item]))

    const formatted = portfolioIds
      .map((id) => {
        const portfolio = portfolioMap.get(id)
        if (!portfolio) return null
        const totalViews = analyticsByPortfolio.get(id) ?? 0

        return {
          id: portfolio.id,
          username:
            portfolio.customUsername ||
            portfolio.user?.githubUsername ||
            `user-${portfolio.id}`,
          displayName: portfolio.displayName ?? "Unknown Developer",
          jobTitle: portfolio.jobTitle,
          bio:
            portfolio.bio && portfolio.bio.length > 160
              ? `${portfolio.bio.slice(0, 157)}...`
              : portfolio.bio,
          profilePic: portfolio.profilePic ?? portfolio.user?.avatarUrl,
          selectedTheme: portfolio.selectedTheme,
          skills: portfolio.skills.map((skill) => ({
            name: skill.name,
            category: skill.category,
          })),
          repositories: portfolio.repositories.map((repo) => ({
            name: repo.repository.name,
            language: repo.repository.language,
            stargazersCount: repo.repository.stargazersCount,
          })),
          updatedAt: portfolio.updatedAt.toISOString(),
          portfolioUrl: `/portfolio/${
            portfolio.customUsername || portfolio.user?.githubUsername
          }`,
          totalViews,
        }
      })
      .filter(Boolean) as FeaturedPortfolio[]

    if (formatted.length < safeLimit) {
      const fallbackNeeded = safeLimit - formatted.length
      const fallbackPortfolios = await prisma.portfolio.findMany({
        where: {
          ...basePortfolioWhere,
          id: { notIn: portfolioIds },
        },
        orderBy: { updatedAt: "desc" },
        take: fallbackNeeded,
        include: basePortfolioInclude,
      })

      const fallbackFormatted = fallbackPortfolios.map((portfolio) => ({
        id: portfolio.id,
        username:
          portfolio.customUsername ||
          portfolio.user?.githubUsername ||
          `user-${portfolio.id}`,
        displayName: portfolio.displayName ?? "Unknown Developer",
        jobTitle: portfolio.jobTitle,
        bio:
          portfolio.bio && portfolio.bio.length > 160
            ? `${portfolio.bio.slice(0, 157)}...`
            : portfolio.bio,
        profilePic: portfolio.profilePic ?? portfolio.user?.avatarUrl,
        selectedTheme: portfolio.selectedTheme,
        skills: portfolio.skills.map((skill) => ({
          name: skill.name,
          category: skill.category,
        })),
        repositories: portfolio.repositories.map((repo) => ({
          name: repo.repository.name,
          language: repo.repository.language,
          stargazersCount: repo.repository.stargazersCount,
        })),
        updatedAt: portfolio.updatedAt.toISOString(),
        portfolioUrl: `/portfolio/${
          portfolio.customUsername || portfolio.user?.githubUsername
        }`,
        totalViews: 0,
      }))

      formatted.push(...fallbackFormatted)
    }

    return formatted
  },
  ["wall-of-fame-top-portfolios"],
  { revalidate: 60 * 60 } // Revalidate every hour for a “static” experience
)

export async function getWallOfFamePortfolios(limit?: number) {
  return fetchTopWallOfFamePortfolios(limit ?? DEFAULT_LIMIT)
}

