import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cache, CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "12")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Check cache first
    const cacheKey = CacheKeys.apiResponse("featured-portfolios", { limit, offset })
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      console.log("🚀 Featured Portfolios API: Returning cached data")
      return NextResponse.json(cachedData)
    }

    console.log("🚀 Featured Portfolios API: Fetching fresh data from database")

    // Fetch featured portfolios
    const portfolios = await prisma.portfolio.findMany({
      where: {
        isPublished: true,
        // Only show portfolios with complete data
        displayName: { not: null },
        profilePic: { not: null },
        customUsername: { not: null }
      },
      include: {
        user: {
          select: {
            githubUsername: true,
            name: true,
            avatarUrl: true
          }
        },
        skills: {
          select: {
            name: true,
            category: true
          },
          take: 5 // Limit skills for preview
        },
        repositories: {
          where: {
            isVisible: true
          },
          select: {
            repository: {
              select: {
                name: true,
                language: true,
                stargazersCount: true,
                favicon: true,
                logo: true
              }
            }
          },
          take: 3 // Limit repos for preview
        }
      },
      orderBy: {
        updatedAt: 'desc' // Show recently updated portfolios first
      },
      take: limit,
      skip: offset
    })

    // Format the data for the frontend
    const formattedPortfolios = portfolios.map(portfolio => ({
      id: portfolio.id,
      username: portfolio.customUsername || portfolio.user.githubUsername,
      displayName: portfolio.displayName,
      jobTitle: portfolio.jobTitle,
      bio: portfolio.bio?.substring(0, 150) + (portfolio.bio && portfolio.bio.length > 150 ? '...' : ''),
      profilePic: portfolio.profilePic || portfolio.user.avatarUrl,
      selectedTheme: portfolio.selectedTheme,
      skills: portfolio.skills.map(skill => ({
        name: skill.name,
        category: skill.category
      })),
      repositories: portfolio.repositories.map(repo => ({
        name: repo.repository.name,
        language: repo.repository.language,
        stargazersCount: repo.repository.stargazersCount
      })),
      updatedAt: portfolio.updatedAt,
      // Generate portfolio URL
      portfolioUrl: `/portfolio/${portfolio.customUsername || portfolio.user.githubUsername}`
    }))

    const responseData = {
      success: true,
      portfolios: formattedPortfolios,
      total: portfolios.length,
      hasMore: portfolios.length === limit
    }

    // Cache the response for 30 minutes
    setCachedData(cacheKey, responseData, 30)
    console.log("🚀 Featured Portfolios API: Data cached for 30 minutes")

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching featured portfolios:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured portfolios" },
      { status: 500 }
    )
  }
}
