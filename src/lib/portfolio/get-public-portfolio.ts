import { prisma } from "@/lib/prisma"
import { CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"
import { getRepositoryLogo, isGitHubFavicon } from "@/lib/github-og-image-utils"

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
    if (serializedPortfolio.repositories) {
      serializedPortfolio.repositories = serializedPortfolio.repositories.map((pr: any) => {
        // Use shared utility to get repository logo (handles all edge cases)
        const logo = getRepositoryLogo({
          logo: pr.repository?.logo || null,
          favicon: pr.repository?.favicon || null,
          htmlUrl: pr.repository?.htmlUrl || null,
          fullName: pr.repository?.fullName || null,
          isImported: pr.repository?.isImported || false
        })
        
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

