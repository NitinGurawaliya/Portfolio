import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

/**
 * Optimized public portfolio API - minimal data, fast loading
 * Only returns what's needed for public display
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now()
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // Check cache first
    const cacheCheckStart = performance.now()
    const cacheKey = CacheKeys.portfolio(`public_${username}`)
    const cachedData = getCachedData(cacheKey)
    const cacheCheckTime = performance.now() - cacheCheckStart
    
    if (cachedData && typeof cachedData === 'object' && 'portfolio' in cachedData) {
      const cachedPortfolio = cachedData as { portfolio?: { repositories?: any[] } }
      const totalTime = performance.now() - startTime
      // Log cache hit for debugging
      console.log(`⚡ Public portfolio cache hit: ${username}`, {
        cacheCheckTime: `${cacheCheckTime.toFixed(2)}ms`,
        totalTime: `${totalTime.toFixed(2)}ms`,
        hasRepositories: !!(cachedPortfolio.portfolio?.repositories?.length),
        repositoriesCount: cachedPortfolio.portfolio?.repositories?.length || 0
      })
      return NextResponse.json(cachedData)
    }

    // Find published portfolio - minimal query
    const dbQueryStart = performance.now()
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        OR: [
          { customUsername: username },
          { user: { githubUsername: username } }
        ],
        isPublished: true
      },
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
        user: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            avatarUrl: true,
            bio: true,
            location: true,
            company: true
          }
        },
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
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        experiences: {
          select: {
            id: true,
            companyName: true,
            companyUrl: true,
            faviconUrl: true,
            role: true,
            duration: true,
            description: true
          },
          orderBy: { createdAt: 'desc' }
        },
        repositories: {
          where: {
            deletedAt: null, // Exclude soft-deleted projects
            isVisible: true   // Only show visible projects
          },
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
                size: true,
                isPrivate: true,
                isFork: true,
                isImported: true,
                favicon: true,
                logo: true,
                siteName: true,
                keywords: true,
                author: true,
                createdAt: true,
                updatedAt: true,
                pushedAt: true
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

    // Serialize BigInt values and ensure repositories are properly formatted
    const serializeStart = performance.now()
    const serializedPortfolio = JSON.parse(JSON.stringify(portfolio, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    // Helper function to generate GitHub OG image URL
    const getGitHubOgImage = (fullName: string | null | undefined): string | null => {
      if (!fullName) return null
      const [owner, repoName] = fullName.split('/')
      if (owner && repoName) {
        return `https://opengraph.githubassets.com/${owner}/${repoName}`
      }
      return null
    }
    
    // Ensure repositories are properly formatted with all required fields
    if (serializedPortfolio.repositories) {
      serializedPortfolio.repositories = serializedPortfolio.repositories.map((pr: any) => {
        // Backward compatibility: Add GitHub OG image if logo is missing and it's a GitHub repo
        // Check both logo and githubOgImage fields
        let logo = pr.repository.logo || pr.repository.githubOgImage || null
        
        // If no logo exists, generate GitHub OG image for any GitHub repo (own or fork)
        // Only skip if it's an imported project (not from GitHub)
        if (!logo && pr.repository.fullName && !pr.repository.isImported) {
          logo = getGitHubOgImage(pr.repository.fullName)
        }
        
        // If still no logo but we have htmlUrl, try to extract fullName from it
        if (!logo && !pr.repository.isImported && pr.repository.htmlUrl) {
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
        let favicon = pr.repository.favicon
        if (favicon && favicon.includes('github.com') && !pr.repository.isImported) {
          favicon = null // Use fallback text instead of GitHub icon
        }
        
        // Filter out GitHub's default description
        const githubDefaultDescPattern = /^Contribute to .* development by creating an account on GitHub\.?$/i
        let description = pr.repository.description || ""
        if (description && githubDefaultDescPattern.test(description.trim())) {
          description = "" // Remove GitHub's default description
        }
        
        // Ensure languages is an array for tech stack display
        let languages = pr.repository.languages
        if (!languages) {
          try {
            languages = typeof pr.repository.languages === 'string' 
              ? JSON.parse(pr.repository.languages) 
              : (pr.repository.language ? [pr.repository.language] : [])
          } catch {
            languages = pr.repository.language ? [pr.repository.language] : []
          }
        }
        
        return {
          ...pr,
          repository: {
            ...pr.repository,
            githubId: pr.repository.githubId ? pr.repository.githubId.toString() : pr.repository.githubId,
            logo: logo, // Include GitHub OG image fallback
            languages: languages, // Ensure languages array for tech stack
            favicon: favicon, // Null for GitHub repos
            description: description // Filtered GitHub default description
          }
        }
      })
    } else {
      console.warn(`⚠️ No repositories found for portfolio ${serializedPortfolio.id}`)
    }
    const serializeTime = performance.now() - serializeStart

    const responseData = {
      success: true,
      portfolio: serializedPortfolio
    }

    // Cache for longer (public pages change less frequently)
    const cacheSetStart = performance.now()
    setCachedData(cacheKey, responseData, CacheTTL.PORTFOLIO)
    const cacheSetTime = performance.now() - cacheSetStart
    
    const totalTime = performance.now() - startTime
    
    // Performance logging
    console.log(`⚡ Public portfolio loaded: ${username}`, {
      portfolioId: serializedPortfolio.id,
      repositoriesCount: serializedPortfolio.repositories?.length || 0,
      visibleRepos: serializedPortfolio.repositories?.filter((r: any) => r.isVisible).length || 0,
      timings: {
        cacheCheck: `${cacheCheckTime.toFixed(2)}ms`,
        dbQuery: `${dbQueryTime.toFixed(2)}ms`,
        serialization: `${serializeTime.toFixed(2)}ms`,
        cacheSet: `${cacheSetTime.toFixed(2)}ms`,
        total: `${totalTime.toFixed(2)}ms`
      }
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

