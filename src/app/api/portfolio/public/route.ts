import { NextRequest, NextResponse } from "next/server"
import { getPublicPortfolio } from "@/lib/portfolio/get-public-portfolio"
import { getRepositoryLogo, isGitHubFavicon } from "@/lib/github-og-image-utils"

// Enable Next.js route caching with revalidation
export const revalidate = 60 // Revalidate every 1 minute (reduced from 5 minutes)

/**
 * Optimized public portfolio API - minimal data, fast loading
 * Uses server-side function for better caching and performance
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now()
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // Use helper function which handles caching and database queries
    const portfolio = await getPublicPortfolio(username)
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    // Format repositories with additional processing (GitHub OG images, favicon filtering, etc.)
    // Ensure repositories are properly formatted with all required fields
    if (portfolio?.repositories) {
      portfolio.repositories = portfolio.repositories.map((pr: any) => {
        // Use shared utility to get repository logo (handles all edge cases)
        const logo = getRepositoryLogo({
          logo: pr.repository?.logo || null,
          favicon: pr.repository?.favicon || null,
          htmlUrl: pr.repository?.htmlUrl || null,
          fullName: pr.repository?.fullName || null,
          isImported: pr.repository?.isImported || false
        })
        
        // For GitHub repos, don't use GitHub favicon - use null for fallback text
        let favicon = pr.repository?.favicon
        if (favicon && favicon.includes('github.com') && !pr.repository?.isImported) {
          favicon = null // Use fallback text instead of GitHub icon
        }
        
        // Filter out GitHub's default description
        const githubDefaultDescPattern = /^Contribute to .* development by creating an account on GitHub\.?$/i
        let description = pr.repository?.description || ""
        if (description && githubDefaultDescPattern.test(description.trim())) {
          description = "" // Remove GitHub's default description
        }
        
        // Ensure languages is an array for tech stack display
        let languages = pr.repository?.languages
        if (!languages) {
          try {
            languages = typeof pr.repository?.languages === 'string' 
              ? JSON.parse(pr.repository.languages) 
              : (pr.repository?.language ? [pr.repository.language] : [])
          } catch {
            languages = pr.repository?.language ? [pr.repository.language] : []
          }
        }
        
        return {
          ...pr,
          repository: {
            ...pr.repository,
            githubId: pr.repository?.githubId ? pr.repository.githubId.toString() : pr.repository?.githubId,
            logo: logo, // Include GitHub OG image fallback
            languages: languages, // Ensure languages array for tech stack
            favicon: favicon, // Null for GitHub repos
            description: description // Filtered GitHub default description
          }
        }
      })
    }
    const responseData = {
      success: true,
      portfolio
    }

    const totalTime = performance.now() - startTime
    
    // Add caching headers for better performance (reduced cache time for faster updates)
    const headers = new Headers()
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120') // 1 min cache, 2 min stale
    
    console.log(`⚡ Public portfolio API: ${username}`, {
      totalTime: `${totalTime.toFixed(2)}ms`
    })

    return NextResponse.json(responseData, { headers })
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

