import { NextRequest, NextResponse } from "next/server"
import { cache, CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"
import { validateSession } from "@/lib/session-validator"

export async function GET(req: NextRequest) {
  try {
    // SECURITY FIX: Use centralized session validation
    const sessionValidation = await validateSession(req)
    
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: sessionValidation.error }, { status: 401 })
    }
    
    const { session, userId } = sessionValidation
    const accessToken = session.accessToken as string

    // SECURITY FIX: Use user ID from validated session for cache key
    // This prevents cache poisoning if username gets corrupted in session
    const cacheKey = CacheKeys.githubUser(`user_${userId}`)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      return NextResponse.json(cachedData, { status: 200 })
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    })

    const data = await userResponse.json()
    
    // Cache the response
    if (userResponse.ok) {
      setCachedData(cacheKey, data, CacheTTL.GITHUB_USER)
      console.log("🚀 GitHub User API: Data cached for", CacheTTL.GITHUB_USER, "minutes")
    }
    
    return NextResponse.json(data, { status: userResponse.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

