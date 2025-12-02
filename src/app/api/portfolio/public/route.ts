import { NextRequest, NextResponse } from "next/server"
import { getPublicPortfolio } from "@/lib/portfolio/get-public-portfolio"

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
    // Helper function to generate GitHub OG image URL
    const getGitHubOgImage = (fullName: string | null | undefined): string | null => {
      if (!fullName) return null
      const [owner, repoName] = fullName.split('/')
      if (owner && repoName) {
        return `https://opengraph.githubassets.com/${owner}/${repoName}`
      }
      return null
    }
    
    // Helper to check if a URL is a GitHub favicon/icon
    const isGitHubFavicon = (url: string | null): boolean => {
      if (!url) return false
      return url.includes('github.com') && (
        url.includes('favicon') || 
        url.includes('github-icon') || 
        url.includes('octocat') ||
        url.includes('github.com/favicon') ||
        url.includes('github.githubassets.com') ||
        url.match(/github\.com\/.*\/favicon/i) !== null
      )
    }
    
    // Ensure repositories are properly formatted with all required fields
    if (portfolio?.repositories) {
      portfolio.repositories = portfolio.repositories.map((pr: any) => {
        // Backward compatibility: Add GitHub OG image if logo is missing and it's a GitHub repo
        let logo = pr.repository?.logo || null
        
        // For old GitHub repos: if logo is a GitHub favicon URL, treat it as null and generate OG image instead
        // This fixes the issue where old repos have GitHub favicon as logo instead of OG image
        if (logo && isGitHubFavicon(logo) && !pr.repository?.isImported) {
          logo = null // Treat GitHub favicon as no logo, will generate OG image below
        }
        
        // Also check: if logo is null/empty but favicon is GitHub favicon, generate OG image
        // This handles cases where old repos have favicon set but logo is null
        if (!logo && pr.repository?.favicon && 
            isGitHubFavicon(pr.repository.favicon) && 
            !pr.repository?.isImported) {
          // Logo is missing but favicon is GitHub, so generate OG image
          logo = null // Will be set below
        }
        
        // If no logo exists, generate GitHub OG image for any GitHub repo (own or fork)
        // Only skip if it's an imported project (not from GitHub)
        if (!logo && pr.repository?.fullName && !pr.repository?.isImported) {
          logo = getGitHubOgImage(pr.repository.fullName)
        }
        
        // If still no logo but we have htmlUrl, try to extract fullName from it
        if (!logo && !pr.repository?.isImported && pr.repository?.htmlUrl) {
          try {
            const url = new URL(pr.repository.htmlUrl)
            if (url.hostname === 'github.com') {
              const pathParts = url.pathname.split('/').filter(Boolean)
              if (pathParts.length >= 2) {
                const fullName = `${pathParts[0]}/${pathParts[1]}`
                logo = getGitHubOgImage(fullName)
              }
            }
          } catch (e) {
            // Ignore URL parsing errors
          }
        }
        
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

