import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"
import { getRepositoryLogo } from "@/lib/github-og-image-utils"

export interface PublicRepositoryPayload {
  githubId?: string | number | bigint | null
  logo?: string | null
  favicon?: string | null
  htmlUrl?: string | null
  fullName?: string | null
  isImported?: boolean | null
  [key: string]: unknown
}

export interface PublicPortfolioRepositoryRecord {
  repository?: PublicRepositoryPayload | null
  [key: string]: unknown
}

export interface SerializedPublicPortfolio {
  id?: number
  repositories?: PublicPortfolioRepositoryRecord[]
  [key: string]: unknown
}

interface PublicPortfolioCachePayload {
  success: boolean
  portfolio: SerializedPublicPortfolio
}

const PUBLIC_PORTFOLIO_SELECT = {
  id: true,
  displayName: true,
  jobTitle: true,
  bio: true,
  profilePic: true,
  customUsername: true,
  selectedTheme: true,
  backgroundColor: true,
  backgroundPattern: true,
  cvUrl: true,
  user: {
    select: {
      id: true,
      name: true,
      githubUsername: true,
      avatarUrl: true,
      bio: true,
      location: true,
      company: true,
    },
  },
  skills: {
    select: {
      id: true,
      name: true,
      category: true,
    },
  },
  socials: {
    select: {
      id: true,
      platform: true,
      username: true,
      url: true,
      isPinned: true,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "asc" }],
  },
  experiences: {
    select: {
      id: true,
      companyName: true,
      companyUrl: true,
      faviconUrl: true,
      role: true,
      duration: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  },
  repositories: {
    where: {
      isVisible: true,
    },
    take: 50,
    select: {
      id: true,
      deployedUrl: true,
      customName: true,
      customDescription: true,
      displayOrder: true,
      isVisible: true,
      projectCategory: true,
      projectStatus: true,
      projectRevenue: true,
      projectMrr: true,
      projectUsers: true,
      technologies: true,
      repository: {
        select: {
          id: true,
          githubId: true,
          name: true,
          fullName: true,
          description: true,
          htmlUrl: true,
          githubUrl: true,
          language: true,
          languages: true,
          stargazersCount: true,
          forksCount: true,
          isPrivate: true,
          isFork: true,
          favicon: true,
          logo: true,
          siteName: true,
          keywords: true,
          author: true,
          pushedAt: true,
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  },
} satisfies Prisma.PortfolioSelect

function serializeBigIntFields<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, nestedValue) => {
      if (typeof nestedValue === "bigint") {
        return nestedValue.toString()
      }
      return nestedValue
    })
  ) as T
}

function normalizePortfolioRepositories(portfolio: SerializedPublicPortfolio): void {
  if (!Array.isArray(portfolio.repositories)) return

  portfolio.repositories = portfolio.repositories.map((portfolioRepository) => {
    const repository = portfolioRepository.repository || {}
    const logo = getRepositoryLogo({
      logo: typeof repository.logo === "string" ? repository.logo : null,
      favicon: typeof repository.favicon === "string" ? repository.favicon : null,
      htmlUrl: typeof repository.htmlUrl === "string" ? repository.htmlUrl : null,
      fullName: typeof repository.fullName === "string" ? repository.fullName : null,
      isImported: Boolean(repository.isImported),
    })

    const githubId = repository.githubId
    const githubIdAsString = githubId ? githubId.toString() : githubId

    return {
      ...portfolioRepository,
      repository: {
        ...repository,
        githubId: githubIdAsString,
        logo,
      },
    }
  })
}

async function findPublishedPortfolioByCustomUsername(username: string) {
  return prisma.portfolio.findFirst({
    where: {
      customUsername: username,
      isPublished: true,
    },
    select: PUBLIC_PORTFOLIO_SELECT,
  })
}

async function findPublishedPortfolioByGithubUsername(username: string) {
  return prisma.portfolio.findFirst({
    where: {
      user: { githubUsername: username },
      isPublished: true,
    },
    select: PUBLIC_PORTFOLIO_SELECT,
  })
}

/**
 * Optimized server-side function to fetch public portfolio
 * Used for server-side rendering to avoid client-side API calls
 */
export async function getPublicPortfolio(username: string) {
  const startTime = performance.now()

  try {
    const cacheKey = CacheKeys.portfolio(`public_${username}`)
    const cachedData = getCachedData<PublicPortfolioCachePayload>(cacheKey)

    if (cachedData?.portfolio) {
      const totalTime = performance.now() - startTime
      console.log(`⚡ Public portfolio cache hit (server): ${username}`, {
        totalTime: `${totalTime.toFixed(2)}ms`,
      })
      return cachedData.portfolio
    }

    const cacheCheckTime = performance.now() - startTime

    const dbQueryStart = performance.now()
    let portfolio = await findPublishedPortfolioByCustomUsername(username)

    if (!portfolio) {
      const githubQueryStart = performance.now()
      portfolio = await findPublishedPortfolioByGithubUsername(username)
      const githubQueryTime = performance.now() - githubQueryStart
      console.log(`🔍 GitHub username query time: ${githubQueryTime.toFixed(2)}ms`)
    }

    const dbQueryTime = performance.now() - dbQueryStart

    if (!portfolio) {
      return null
    }

    const serializeStart = performance.now()
    const serializedPortfolio = serializeBigIntFields(portfolio) as SerializedPublicPortfolio
    const serializeTime = performance.now() - serializeStart

    normalizePortfolioRepositories(serializedPortfolio)

    const responseData: PublicPortfolioCachePayload = {
      success: true,
      portfolio: serializedPortfolio,
    }

    const cacheSetStart = performance.now()
    setCachedData(cacheKey, responseData, CacheTTL.PORTFOLIO)
    const cacheSetTime = performance.now() - cacheSetStart

    const totalTime = performance.now() - startTime
    console.log(`⚡ Public portfolio loaded (server): ${username}`, {
      portfolioId: serializedPortfolio.id,
      repositoriesCount: serializedPortfolio.repositories?.length || 0,
      timings: {
        cacheCheck: `${cacheCheckTime.toFixed(2)}ms`,
        dbQuery: `${dbQueryTime.toFixed(2)}ms`,
        serialization: `${serializeTime.toFixed(2)}ms`,
        cacheSet: `${cacheSetTime.toFixed(2)}ms`,
        total: `${totalTime.toFixed(2)}ms`,
      },
    })

    return serializedPortfolio
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return null
  }
}
