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
    const cacheKey = CacheKeys.githubRepos(`user_${userId}`)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      return NextResponse.json(cachedData, { status: 200 })
    }

    const url = new URL("https://api.github.com/user/repos")
    url.searchParams.set("sort", "updated")
    url.searchParams.set("per_page", "100")

    const githubRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    })

    const repos = await githubRes.json()
    
    // Fetch languages for each repository and add GitHub OG image URL
    const reposWithLanguages = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const langRes = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
            cache: "no-store",
          })
          
          if (langRes.ok) {
            const languages = await langRes.json()
            repo.languages = Object.keys(languages) // Add languages array
          } else {
            repo.languages = repo.language ? [repo.language] : []
          }
        } catch (error) {
          console.error(`Error fetching languages for ${repo.name}:`, error)
          repo.languages = repo.language ? [repo.language] : []
        }
        
        // Add GitHub OG image URL (the SEO preview image GitHub generates)
        // Format: https://opengraph.githubassets.com/{timestamp}/{owner}/{repo}
        if (repo.full_name) {
          const [owner, repoName] = repo.full_name.split('/')
          if (owner && repoName) {
            // GitHub OG images use a timestamp for cache busting, but we can use a simple format
            // The actual URL format is: https://opengraph.githubassets.com/{owner}/{repo}
            repo.githubOgImage = `https://opengraph.githubassets.com/${owner}/${repoName}`
          }
        }
        
        return repo
      })
    )
    
    // Cache the response
    if (githubRes.ok) {
      setCachedData(cacheKey, reposWithLanguages, CacheTTL.GITHUB_REPOS)
      console.log("🚀 GitHub Repos API: Data cached for", CacheTTL.GITHUB_REPOS, "minutes")
    }
    
    return NextResponse.json(reposWithLanguages, { status: githubRes.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 })
  }
}

