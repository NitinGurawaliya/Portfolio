import { NextRequest, NextResponse } from "next/server"
import { cache, CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const session = JSON.parse(sessionCookie)
    const accessToken = session.accessToken as string | undefined
    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }

    // Check cache first
    const cacheKey = CacheKeys.githubUser(session.user?.login || 'unknown')
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

