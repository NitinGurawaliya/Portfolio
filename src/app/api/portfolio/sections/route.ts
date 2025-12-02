import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"
import { validateSession } from "@/lib/session-validator"
import { getRepositoryLogo, isGitHubFavicon } from "@/lib/github-og-image-utils"

/**
 * Optimized API - Loads repos, skills, socials in parallel
 * Returns only essential fields for each section
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now()
  try {
    // SECURITY FIX: Use centralized session validation
    const sessionValidation = await validateSession(req)
    
    if (!sessionValidation.valid) {
      return NextResponse.json({ error: sessionValidation.error }, { status: 401 })
    }

    const { user: loggedInUser, userId } = sessionValidation
    const userQueryTime = 0 // Already validated in validateSession

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
                languages: true, // Add languages for tech stack
                stargazersCount: true,
                forksCount: true,
                favicon: true,
                logo: true,
                isImported: true // Add isImported to check if it's a GitHub repo
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
      repositories: portfolio.repositories.map((pr: any) => {
        // Use shared utility to get repository logo (handles all edge cases)
        const logo = getRepositoryLogo({
          logo: pr.repository.logo || pr.repository.githubOgImage || null,
          favicon: pr.repository.favicon || null,
          htmlUrl: pr.repository.htmlUrl || null,
          fullName: pr.repository.fullName || null,
          isImported: pr.repository.isImported || false
        })
        
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
            githubId: pr.repository.githubId.toString(),
            logo: logo, // Include GitHub OG image fallback
            languages: languages, // Ensure languages array for tech stack
            favicon: favicon, // Null for GitHub repos
            description: description // Filtered GitHub default description
          }
        }
      })
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

