import { prisma } from "@/lib/prisma"
import { getProjectSlugMap, matchProjectBySlug } from "@/lib/project-slug"
import type { PublicProjectPageData } from "@/types/public-project"

const reservedRoutes = ["dashboard", "auth", "api", "_next", "favicon.ico"]

export async function getPublicProjectPageData(
  username: string,
  projectSlug: string,
  viewerId?: number
): Promise<PublicProjectPageData | null> {
  if (!username || reservedRoutes.includes(username)) {
    return null
  }

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      isPublished: true,
      OR: [
        { customUsername: username },
        { user: { githubUsername: username } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      bio: true,
      jobTitle: true,
      profilePic: true,
      customUsername: true,
      cvUrl: true,
      user: {
        select: {
          id: true,
          name: true,
          githubUsername: true,
          avatarUrl: true,
          company: true,
          location: true,
          websiteUrl: true,
        },
      },
      skills: {
        select: {
          id: true,
          name: true,
          category: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      repositories: {
        where: {
          isVisible: true,
          deletedAt: null,
        },
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: {
          id: true,
          customName: true,
          customDescription: true,
          deployedUrl: true,
          technologies: true,
          updatedAt: true,
          createdAt: true,
            projectCategory: true,
            projectStatus: true,
            projectRevenue: true,
            projectMrr: true,
            projectUsers: true,
          repository: {
            select: {
              id: true,
              name: true,
              fullName: true, // Add fullName for GitHub OG image generation
              description: true,
              htmlUrl: true,
              githubUrl: true,
              favicon: true,
              logo: true,
              stargazersCount: true,
              forksCount: true,
              language: true,
              languages: true,
              siteName: true,
              isImported: true, // Add isImported to check if it's a GitHub repo
            },
          },
        },
      },
    },
  })

  if (!portfolio || portfolio.repositories.length === 0) {
    return null
  }

  const project = matchProjectBySlug(portfolio.repositories, projectSlug)
  if (!project) {
    return null
  }

  const slugMap = getProjectSlugMap(portfolio.repositories)
  const resolvedSlug = slugMap[project.id] ?? projectSlug

  const portfolioSlug =
    portfolio.customUsername || portfolio.user.githubUsername || username

  const projectIdBigInt = BigInt(project.id)
  const now = new Date()

  const last7 = new Date(now)
  last7.setDate(now.getDate() - 6)
  last7.setHours(0, 0, 0, 0)

  const last30 = new Date(now)
  last30.setDate(now.getDate() - 29)
  last30.setHours(0, 0, 0, 0)

  const [totalViewsAgg, last7Agg, last30Agg, upvotesCount, shiplogs, viewerUpvoteRecord] =
    await Promise.all([
      prisma.dailyProjectViews.aggregate({
        where: {
          portfolioId: portfolio.id,
          projectId: projectIdBigInt,
        },
        _sum: { views: true },
      }),
      prisma.dailyProjectViews.aggregate({
        where: {
          portfolioId: portfolio.id,
          projectId: projectIdBigInt,
          date: {
            gte: last7,
          },
        },
        _sum: { views: true },
      }),
      prisma.dailyProjectViews.aggregate({
        where: {
          portfolioId: portfolio.id,
          projectId: projectIdBigInt,
          date: {
            gte: last30,
          },
        },
        _sum: { views: true },
      }),
      prisma.projectUpvote.count({
        where: {
          portfolioRepositoryId: project.id,
        },
      }),
      prisma.shiplog.findMany({
        where: {
          portfolioRepositoryId: project.id,
        },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              customName: true,
              repository: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      viewerId
        ? prisma.projectUpvote.findUnique({
            where: {
              userId_portfolioRepositoryId: {
                userId: viewerId,
                portfolioRepositoryId: project.id,
              },
            },
            select: {
              userId: true,
            },
          })
        : null,
    ])

  const viewerHasUpvoted = Boolean(viewerUpvoteRecord)

  const languages: string[] = (() => {
    const raw = project.repository?.languages
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed
            .map((lang) => (typeof lang === "string" ? lang : ""))
            .filter(Boolean)
        }
      } catch {
        // fall back to single language
      }
    }
    return project.repository?.language ? [project.repository.language] : []
  })()

  const projectTitle = project.customName || project.repository?.name || ""
  const primaryDescription =
    project.customDescription || project.repository?.description || ""

  const linkedShiplogs = shiplogs.map((entry) => ({
    id: entry.id,
    content: entry.content,
    imageUrl: entry.imageUrl,
    createdAt: entry.createdAt.toISOString(),
    project: entry.project
      ? {
          id: entry.project.id,
          name:
            entry.project.customName ||
            entry.project.repository?.name ||
            projectTitle,
        }
      : null,
  }))

  const statsViewsTotal = totalViewsAgg._sum.views ?? 0
  const statsViews7 = last7Agg._sum.views ?? 0
  const statsViews30 = last30Agg._sum.views ?? 0

  // Get deployedUrl with fallback to repository htmlUrl
  const deployedUrl = project.deployedUrl 
    || project.repository?.htmlUrl 
    || null

  // Backward compatibility: Generate GitHub OG image for old repos without logos
  const getGitHubOgImage = (fullName: string | null | undefined): string | null => {
    if (!fullName) return null
    const [owner, repoName] = fullName.split('/')
    if (owner && repoName) {
      return `https://opengraph.githubassets.com/${owner}/${repoName}`
    }
    return null
  }

  // Priority: 1. Existing logo (if not GitHub favicon), 2. GitHub OG image (if GitHub repo), 3. null
  // Check logo field (githubOgImage is not in the select, so we generate it if needed)
  let projectLogo = project.repository?.logo || null
  
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
  
  // For old GitHub repos: if logo is a GitHub favicon URL, treat it as null and generate OG image instead
  // This fixes the issue where old repos have GitHub favicon as logo instead of OG image
  if (projectLogo && isGitHubFavicon(projectLogo) && !project.repository?.isImported) {
    projectLogo = null // Treat GitHub favicon as no logo, will generate OG image below
  }
  
  // Also check: if logo is null/empty but favicon is GitHub favicon, generate OG image
  // This handles cases where old repos have favicon set but logo is null
  if (!projectLogo && project.repository?.favicon && 
      isGitHubFavicon(project.repository.favicon) && 
      !project.repository?.isImported) {
    // Logo is missing but favicon is GitHub, so generate OG image
    projectLogo = null // Will be set below
  }
  
  // If no logo exists, generate GitHub OG image for any GitHub repo (own or fork)
  // Only skip if it's an imported project (not from GitHub)
  if (!projectLogo && project.repository?.fullName && !project.repository?.isImported) {
    projectLogo = getGitHubOgImage(project.repository.fullName)
  }
  
  // If still no logo but we have htmlUrl, try to extract fullName from it
  if (!projectLogo && !project.repository?.isImported && project.repository?.htmlUrl) {
    try {
      const url = new URL(project.repository.htmlUrl)
      if (url.hostname === 'github.com') {
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length >= 2) {
          const extractedFullName = `${pathParts[0]}/${pathParts[1]}`
          projectLogo = getGitHubOgImage(extractedFullName)
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  // For GitHub repos, don't use GitHub favicon - use null for fallback text
  let projectFavicon = project.repository?.favicon ?? null
  if (projectFavicon && projectFavicon.includes('github.com') && !project.repository?.isImported) {
    projectFavicon = null // Use fallback text instead of GitHub icon
  }

  return {
    slug: resolvedSlug,
    project: {
      id: project.id,
      title: projectTitle,
      description: primaryDescription,
      deployedUrl: deployedUrl,
      githubUrl: project.repository?.githubUrl || project.repository?.htmlUrl,
      favicon: projectFavicon,
      logo: projectLogo, // Include GitHub OG image fallback for old repos
      technologies: project.technologies,
      languages,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
        category: project.projectCategory || null,
        status: project.projectStatus || null,
        revenue: project.projectRevenue ?? null,
        mrr: project.projectMrr ?? null,
        users: project.projectUsers ?? null,
    },
    portfolio: {
      id: portfolio.id,
      name:
        portfolio.displayName ||
        portfolio.user.name ||
        portfolio.user.githubUsername ||
        username,
      jobTitle: portfolio.jobTitle || null,
      bio: portfolio.bio || "",
      profilePic: portfolio.profilePic || portfolio.user.avatarUrl || null,
      slug: portfolioSlug,
      githubUsername: portfolio.user.githubUsername,
      websiteUrl: portfolio.user.websiteUrl || null,
      company: portfolio.user.company || null,
      location: portfolio.user.location || null,
      projectCount: portfolio.repositories.length,
      cvUrl: portfolio.cvUrl || null,
      skills: portfolio.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
      })),
    },
    stats: {
      totalViews: statsViewsTotal,
      views7Days: statsViews7,
      views30Days: statsViews30,
      upvotes: upvotesCount,
      stars: project.repository?.stargazersCount ?? 0,
      forks: project.repository?.forksCount ?? 0,
    },
    viewerHasUpvoted,
    shiplogs: linkedShiplogs,
  }
}

