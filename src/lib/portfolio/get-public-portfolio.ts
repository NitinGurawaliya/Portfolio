import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

/**
 * Optimized server-side function to fetch public portfolio
 * Used for server-side rendering to avoid client-side API calls
 */
export async function getPublicPortfolio(username: string) {
  const startTime = performance.now()
  
  try {
    // Check cache first
    const cacheKey = CacheKeys.portfolio(`public_${username}`)
    const cachedData = getCachedData<{ success: boolean; portfolio: any }>(cacheKey)
    
    if (cachedData?.portfolio) {
      const totalTime = performance.now() - startTime
      console.log(`⚡ Public portfolio cache hit (server): ${username}`, {
        totalTime: `${totalTime.toFixed(2)}ms`
      })
      return cachedData.portfolio
    }

    // Optimized: Try customUsername first (uses composite index), then githubUsername
    // This is faster than OR query which may not use indexes efficiently
    const cacheCheckTime = performance.now() - startTime
    
    const dbQueryStart = performance.now()
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        customUsername: username,
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
            isVisible: true // Only fetch visible repositories
          },
          take: 50, // Limit to 50 repositories max for performance
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
                isPrivate: true,
                isFork: true,
                favicon: true,
                logo: true,
                siteName: true,
                keywords: true,
                author: true,
                pushedAt: true
                // Removed: size, isImported, createdAt, updatedAt (not needed for display)
              }
            }
          },
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    // If not found by customUsername, try githubUsername
    if (!portfolio) {
      const githubQueryStart = performance.now()
      portfolio = await prisma.portfolio.findFirst({
        where: {
          user: { githubUsername: username },
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
              isVisible: true
            },
            take: 50, // Limit to 50 repositories max for performance
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
                  isPrivate: true,
                  isFork: true,
                  favicon: true,
                  logo: true,
                  siteName: true,
                  keywords: true,
                  author: true,
                  pushedAt: true
                  // Removed: size, isImported, createdAt, updatedAt (not needed for display)
                }
              }
            },
            orderBy: { displayOrder: 'asc' }
          }
        }
      })
      const githubQueryTime = performance.now() - githubQueryStart
      console.log(`🔍 GitHub username query time: ${githubQueryTime.toFixed(2)}ms`)
    }

    const dbQueryTime = performance.now() - dbQueryStart

    if (!portfolio) {
      return null
    }

    // Optimized serialization - handle BigInt efficiently
    const serializeStart = performance.now()
    const serializedPortfolio = JSON.parse(
      JSON.stringify(portfolio, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    )
    const serializeTime = performance.now() - serializeStart

    // Format repositories with githubId as string and handle old GitHub repos
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
        /github\.com\/.*\/favicon/i.test(url)
      )
    }
    
    if (serializedPortfolio.repositories) {
      serializedPortfolio.repositories = serializedPortfolio.repositories.map((pr: any) => {
        let logo = pr.repository?.logo || null
        
        // For old GitHub repos: if logo is a GitHub favicon URL, treat it as null and generate OG image instead
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
                const extractedFullName = `${pathParts[0]}/${pathParts[1]}`
                logo = getGitHubOgImage(extractedFullName)
              }
            }
          } catch (e) {
            // Ignore URL parsing errors
          }
        }
        
        return {
          ...pr,
          repository: {
            ...pr.repository,
            githubId: pr.repository.githubId ? pr.repository.githubId.toString() : pr.repository.githubId,
            logo: logo // Include GitHub OG image fallback for old repos
          }
        }
      })
    }

    const responseData = {
      success: true,
      portfolio: serializedPortfolio
    }

    // Cache for longer (public pages change less frequently)
    const cacheSetStart = performance.now()
    setCachedData(cacheKey, responseData, CacheTTL.PORTFOLIO)
    const cacheSetTime = performance.now() - cacheSetStart
    
    const totalTime = performance.now() - startTime
    console.log(`⚡ Public portfolio loaded (server): ${username}`, {
      portfolioId: serializedPortfolio.id,
      repositoriesCount: serializedPortfolio.repositories?.length || 0,
      timings: {
        cacheCheck: `${cacheCheckTime.toFixed(2)}ms`,
        dbQuery: `${dbQueryTime.toFixed(2)}ms`,
        serialization: `${serializeTime.toFixed(2)}ms`,
        cacheSet: `${cacheSetTime.toFixed(2)}ms`,
        total: `${totalTime.toFixed(2)}ms`
      }
    })

    return serializedPortfolio
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return null
  }
}

