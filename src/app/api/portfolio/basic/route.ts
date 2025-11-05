import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

/**
 * Lightweight API - Only basic portfolio data (for instant dashboard loading)
 * Returns only: displayName, jobTitle, bio, profilePic, customUsername, experiences, cvUrl
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
    const cacheKey = CacheKeys.portfolio(`basic_${loggedInUser.id}`)
    const cachedData = getCachedData(cacheKey)
    const cacheCheckTime = performance.now() - cacheCheckStart
    
    if (cachedData) {
      const totalTime = performance.now() - startTime
      console.log(`⚡ Portfolio basic cache hit`, {
        cacheCheckTime: `${cacheCheckTime.toFixed(2)}ms`,
        totalTime: `${totalTime.toFixed(2)}ms`
      })
      return NextResponse.json(cachedData)
    }

    // Fetch only basic fields - minimal database query
    const dbQueryStart = performance.now()
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: loggedInUser.id },
      select: {
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
          orderBy: { createdAt: 'desc' }
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
      portfolio: JSON.parse(JSON.stringify(portfolio, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
    }
    const serializeTime = performance.now() - serializeStart

    // Cache for 5 minutes (basic data changes less frequently)
    const cacheSetStart = performance.now()
    setCachedData(cacheKey, responseData, 5)
    const cacheSetTime = performance.now() - cacheSetStart

    const totalTime = performance.now() - startTime
    
    console.log(`⚡ Portfolio basic loaded`, {
      timings: {
        userQuery: `${userQueryTime.toFixed(2)}ms`,
        cacheCheck: `${cacheCheckTime.toFixed(2)}ms`,
        dbQuery: `${dbQueryTime.toFixed(2)}ms`,
        serialization: `${serializeTime.toFixed(2)}ms`,
        cacheSet: `${cacheSetTime.toFixed(2)}ms`,
        total: `${totalTime.toFixed(2)}ms`
      },
      data: {
        portfolioId: portfolio.id,
        experiencesCount: portfolio.experiences?.length || 0
      }
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching basic portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

