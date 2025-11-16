import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

/**
 * Optimized API - Loads repos, skills, socials in parallel
 * Returns only essential fields for each section
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now()
  try {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let session
    try {
      session = JSON.parse(sessionCookie)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const loggedInUserId = session.user?.id
    if (!loggedInUserId) {
      return NextResponse.json({ error: "Session invalid" }, { status: 401 })
    }

    const userQueryStart = performance.now()
    const loggedInUser = await prisma.user.findUnique({
      where: { githubId: loggedInUserId.toString() }
    })
    const userQueryTime = performance.now() - userQueryStart

    if (!loggedInUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check cache
    const cacheCheckStart = performance.now()
    const cacheKey = CacheKeys.portfolio(`sections_${loggedInUser.id}`)
    const cachedData = getCachedData(cacheKey)
    const cacheCheckTime = performance.now() - cacheCheckStart
    
    if (cachedData) {
      const totalTime = performance.now() - startTime
      console.log(`⚡ Portfolio sections cache hit`, {
        cacheCheckTime: `${cacheCheckTime.toFixed(2)}ms`,
        totalTime: `${totalTime.toFixed(2)}ms`
      })
      return NextResponse.json(cachedData)
    }

    // Fetch portfolio with minimal includes - only what's needed for sections
    const dbQueryStart = performance.now()
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: loggedInUser.id },
      select: {
        id: true,
        skills: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        socials: {
          select: {
            id: true,
            platform: true,
            username: true,
            url: true,
            isPinned: true
          }
        },
        repositories: {
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
                stargazersCount: true,
                forksCount: true,
                favicon: true,
                logo: true
              }
            }
          },
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    const dbQueryTime = performance.now() - dbQueryStart
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    const serializeStart = performance.now()
    const responseData = {
      success: true,
      skills: portfolio.skills,
      socials: portfolio.socials,
      repositories: portfolio.repositories.map((pr: any) => ({
        ...pr,
        repository: {
          ...pr.repository,
          githubId: pr.repository.githubId.toString()
        }
      }))
    }
    const serializeTime = performance.now() - serializeStart

    // Cache for 5 minutes
    const cacheSetStart = performance.now()
    setCachedData(cacheKey, responseData, 5)
    const cacheSetTime = performance.now() - cacheSetStart

    const totalTime = performance.now() - startTime
    
    console.log(`⚡ Portfolio sections loaded`, {
      timings: {
        userQuery: `${userQueryTime.toFixed(2)}ms`,
        cacheCheck: `${cacheCheckTime.toFixed(2)}ms`,
        dbQuery: `${dbQueryTime.toFixed(2)}ms`,
        serialization: `${serializeTime.toFixed(2)}ms`,
        cacheSet: `${cacheSetTime.toFixed(2)}ms`,
        total: `${totalTime.toFixed(2)}ms`
      },
      data: {
        skillsCount: portfolio.skills.length,
        socialsCount: portfolio.socials.length,
        repositoriesCount: portfolio.repositories.length
      }
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching portfolio sections:", error)
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}

