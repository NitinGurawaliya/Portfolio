import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export type PublishPortfolioInput = {
  portfolioData: {
    displayName?: string
    jobTitle?: string
    bio?: string
    profilePic?: string
    customUsername?: string
  }
  selectedRepos?: number[]
  skills?: Array<{ name: string; category: string }>
  deployedUrls?: Record<number, string | null | undefined>
  userId: string
  userData?: {
    name?: string
    email?: string | null
    githubUsername?: string
    avatarUrl?: string
    bio?: string | null
    location?: string | null
    websiteUrl?: string | null
    twitterUsername?: string | null
    company?: string | null
    publicRepos?: number
    followers?: number
    following?: number
  }
}

function resolveUserEmail(existingEmail: string | null | undefined, candidateEmail: string | null | undefined, userId: string): string {
  if (existingEmail && !existingEmail.includes("@placeholder.com")) return existingEmail
  if (candidateEmail && candidateEmail.trim()) return candidateEmail.trim()
  return `github-${userId}@placeholder.com`
}

export async function publishPortfolio(input: PublishPortfolioInput) {
  const { portfolioData, selectedRepos = [], skills = [], deployedUrls = {}, userId, userData } = input

  const existingUser = await prisma.user.findUnique({ where: { githubId: userId.toString() } })
  const userEmail = resolveUserEmail(existingUser?.email, userData?.email ?? null, userId)

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.upsert({
      where: { githubId: userId.toString() },
      update: {
        name: userData?.name || existingUser?.name || "",
        email: userEmail,
        githubUsername: userData?.githubUsername || existingUser?.githubUsername || "",
        avatarUrl: userData?.avatarUrl || existingUser?.avatarUrl || "",
        bio: userData?.bio || existingUser?.bio || "",
        location: userData?.location || existingUser?.location || "",
        websiteUrl: userData?.websiteUrl || existingUser?.websiteUrl || "",
        twitterUsername: userData?.twitterUsername || existingUser?.twitterUsername || "",
        company: userData?.company || existingUser?.company || "",
        publicRepos: userData?.publicRepos || existingUser?.publicRepos || 0,
        followers: userData?.followers || existingUser?.followers || 0,
        following: userData?.following || existingUser?.following || 0,
      },
      create: {
        githubId: userId.toString(),
        name: userData?.name || "",
        email: userEmail,
        githubUsername: userData?.githubUsername || "",
        avatarUrl: userData?.avatarUrl || "",
        bio: userData?.bio || "",
        location: userData?.location || "",
        websiteUrl: userData?.websiteUrl || "",
        twitterUsername: userData?.twitterUsername || "",
        company: userData?.company || "",
        publicRepos: userData?.publicRepos || 0,
        followers: userData?.followers || 0,
        following: userData?.following || 0,
      },
    })

    const portfolio = await tx.portfolio.upsert({
      where: { userId: user.id },
      update: {
        displayName: portfolioData.displayName,
        jobTitle: portfolioData.jobTitle,
        bio: portfolioData.bio,
        profilePic: portfolioData.profilePic,
        customUsername: portfolioData.customUsername,
        isPublished: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        displayName: portfolioData.displayName,
        jobTitle: portfolioData.jobTitle,
        bio: portfolioData.bio,
        profilePic: portfolioData.profilePic,
        customUsername: portfolioData.customUsername,
        isPublished: true,
      },
    })

    await tx.skill.deleteMany({ where: { portfolioId: portfolio.id } })
    await tx.portfolioRepository.deleteMany({ where: { portfolioId: portfolio.id } })

    if (skills.length > 0) {
      await tx.skill.createMany({
        data: skills.map((s) => ({ name: s.name, category: s.category, portfolioId: portfolio.id })),
      })
    }

    if (selectedRepos.length > 0) {
      const repoRecords = await tx.repository.findMany({
        where: { githubId: { in: selectedRepos.map((id) => BigInt(id)) } },
        select: { id: true, githubId: true },
      })
      const githubIdToDbId = new Map<string, number>(repoRecords.map((r) => [r.githubId.toString(), r.id]))

      const portfolioRepos = selectedRepos
        .map((githubId) => ({
          portfolioId: portfolio.id,
          repositoryId: githubIdToDbId.get(String(githubId)),
          deployedUrl: deployedUrls[githubId] || null,
          isVisible: true,
        }))
        .filter((pr) => Boolean(pr.repositoryId)) as Array<{
        portfolioId: number
        repositoryId: number
        deployedUrl: string | null
        isVisible: boolean
      }>

      if (portfolioRepos.length > 0) {
        await tx.portfolioRepository.createMany({ data: portfolioRepos })
      }
    }

    return { portfolio, user }
  })

  return result
}

export async function updateHomeSection(input: {
  userId: string
  userData?: PublishPortfolioInput["userData"]
  portfolioData: PublishPortfolioInput["portfolioData"]
}) {
  const { userId, userData, portfolioData } = input

  const userEmail = userData?.email && userData.email.trim() ? userData.email.trim() : `github-${userId}@placeholder.com`

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.upsert({
      where: { githubId: userId.toString() },
      update: {
        name: userData?.name || "",
        email: userEmail,
        githubUsername: userData?.githubUsername || "",
        avatarUrl: userData?.avatarUrl || "",
        bio: userData?.bio || "",
        location: userData?.location || "",
        websiteUrl: userData?.websiteUrl || "",
        twitterUsername: userData?.twitterUsername || "",
        company: userData?.company || "",
        publicRepos: userData?.publicRepos || 0,
        followers: userData?.followers || 0,
        following: userData?.following || 0,
      },
      create: {
        githubId: userId.toString(),
        name: userData?.name || "",
        email: userEmail,
        githubUsername: userData?.githubUsername || "",
        avatarUrl: userData?.avatarUrl || "",
        bio: userData?.bio || "",
        location: userData?.location || "",
        websiteUrl: userData?.websiteUrl || "",
        twitterUsername: userData?.twitterUsername || "",
        company: userData?.company || "",
        publicRepos: userData?.publicRepos || 0,
        followers: userData?.followers || 0,
        following: userData?.following || 0,
      },
    })

    const portfolio = await tx.portfolio.upsert({
      where: { userId: user.id },
      update: {
        displayName: portfolioData.displayName,
        jobTitle: portfolioData.jobTitle,
        bio: portfolioData.bio,
        profilePic: portfolioData.profilePic,
        customUsername: portfolioData.customUsername,
        isPublished: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        displayName: portfolioData.displayName,
        jobTitle: portfolioData.jobTitle,
        bio: portfolioData.bio,
        profilePic: portfolioData.profilePic,
        customUsername: portfolioData.customUsername,
        isPublished: true,
      },
    })

    return portfolio
  })

  return result
}

export async function savePortfolioRepos(input: {
  userId: string
  userData?: PublishPortfolioInput["userData"]
  repositories?: any[]
  selectedRepos?: number[]
  deployedUrls?: Record<number, string | null | undefined>
}) {
  const { userId, userData, repositories = [], selectedRepos = [], deployedUrls = {} } = input

  const userEmail = userData?.email && userData.email.trim() ? userData.email.trim() : `github-${userId}@placeholder.com`

  const user = await prisma.user.upsert({
    where: { githubId: userId.toString() },
    update: {
      name: userData?.name || "",
      email: userEmail,
      githubUsername: userData?.githubUsername || "",
      avatarUrl: userData?.avatarUrl || "",
      bio: userData?.bio || "",
      location: userData?.location || "",
      websiteUrl: userData?.websiteUrl || "",
      twitterUsername: userData?.twitterUsername || "",
      company: userData?.company || "",
      publicRepos: userData?.publicRepos || 0,
      followers: userData?.followers || 0,
      following: userData?.following || 0,
    },
    create: {
      githubId: userId.toString(),
      name: userData?.name || "",
      email: userEmail,
      githubUsername: userData?.githubUsername || "",
      avatarUrl: userData?.avatarUrl || "",
      bio: userData?.bio || "",
      location: userData?.location || "",
      websiteUrl: userData?.websiteUrl || "",
      twitterUsername: userData?.twitterUsername || "",
      company: userData?.company || "",
      publicRepos: userData?.publicRepos || 0,
      followers: userData?.followers || 0,
      following: userData?.following || 0,
    },
  })

  let portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } })
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        displayName: userData?.name || "",
        bio: userData?.bio || "",
        profilePic: userData?.avatarUrl || "",
        customUsername: userData?.githubUsername || "",
        isPublished: true,
      },
    })
  } else {
    portfolio = await prisma.portfolio.update({ where: { userId: user.id }, data: { isPublished: true } })
  }

  if (repositories.length > 0) {
    const repositoryData = repositories.map((repo: any) => ({
      githubId: BigInt(repo.id),
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      htmlUrl: repo.htmlUrl,
      cloneUrl: repo.cloneUrl || repo.htmlUrl + (repo.isImported ? "" : ".git"),
      language: repo.language,
      stargazersCount: repo.stargazersCount,
      forksCount: repo.forksCount,
      size: repo.size || 0,
      isPrivate: repo.isPrivate,
      isFork: repo.isFork,
      isImported: repo.isImported || false,
      favicon: repo.favicon || null,
      siteName: repo.siteName || null,
      keywords: repo.keywords || null,
      author: repo.author || null,
      userId: user.id,
      createdAt: new Date(repo.createdAt),
      updatedAt: new Date(repo.updatedAt),
      pushedAt: repo.pushedAt ? new Date(repo.pushedAt) : null,
    }))

    await prisma.repository.createMany({ data: repositoryData, skipDuplicates: true })
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.portfolioRepository.deleteMany({ where: { portfolioId: portfolio!.id } })

    if (selectedRepos.length > 0) {
      const savedRepos = await tx.repository.findMany({
        where: { githubId: { in: selectedRepos.map((id) => BigInt(id)) }, userId: user.id },
        select: { id: true, githubId: true },
      })

      const map: Record<number, number> = {}
      savedRepos.forEach((r) => (map[Number(r.githubId)] = r.id))

      const portfolioRepos = selectedRepos
        .map((githubId) => ({
          portfolioId: portfolio!.id,
          repositoryId: map[githubId],
          deployedUrl: deployedUrls[githubId] || null,
          isVisible: true,
        }))
        .filter((pr) => Boolean(pr.repositoryId)) as Array<{
        portfolioId: number
        repositoryId: number
        deployedUrl: string | null
        isVisible: boolean
      }>

      if (portfolioRepos.length > 0) {
        await tx.portfolioRepository.createMany({ data: portfolioRepos })
      }
    }

    return { portfolio, selectedRepos }
  })

  return result
}

export async function saveSkills(input: { userId: string; userData?: PublishPortfolioInput["userData"]; skills?: Array<{ name: string; category: string }> }) {
  const { userId, userData, skills = [] } = input

  const userEmail = userData?.email && userData.email.trim() ? userData.email.trim() : `github-${userId}@placeholder.com`

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.upsert({
      where: { githubId: userId.toString() },
      update: {
        name: userData?.name || "",
        email: userEmail,
        githubUsername: userData?.githubUsername || "",
        avatarUrl: userData?.avatarUrl || "",
        bio: userData?.bio || "",
        location: userData?.location || "",
        websiteUrl: userData?.websiteUrl || "",
        twitterUsername: userData?.twitterUsername || "",
        company: userData?.company || "",
        publicRepos: userData?.publicRepos || 0,
        followers: userData?.followers || 0,
        following: userData?.following || 0,
      },
      create: {
        githubId: userId.toString(),
        name: userData?.name || "",
        email: userEmail,
        githubUsername: userData?.githubUsername || "",
        avatarUrl: userData?.avatarUrl || "",
        bio: userData?.bio || "",
        location: userData?.location || "",
        websiteUrl: userData?.websiteUrl || "",
        twitterUsername: userData?.twitterUsername || "",
        company: userData?.company || "",
        publicRepos: userData?.publicRepos || 0,
        followers: userData?.followers || 0,
        following: userData?.following || 0,
      },
    })

    let portfolio = await tx.portfolio.findUnique({ where: { userId: user.id } })
    if (!portfolio) {
      portfolio = await tx.portfolio.create({
        data: {
          userId: user.id,
          displayName: userData?.name || "",
          bio: userData?.bio || "",
          profilePic: userData?.avatarUrl || "",
          customUsername: userData?.githubUsername || "",
          isPublished: true,
        },
      })
    } else {
      portfolio = await tx.portfolio.update({ where: { userId: user.id }, data: { isPublished: true } })
    }

    await tx.skill.deleteMany({ where: { portfolioId: portfolio.id } })

    if (skills.length > 0) {
      await tx.skill.createMany({ data: skills.map((s) => ({ name: s.name, category: s.category, portfolioId: portfolio.id })) })
    }

    return { portfolio, skills }
  })

  return result
}

export async function saveSocials(input: { userId: string; userData?: PublishPortfolioInput["userData"]; socials: Array<{ platform: string; username: string; url?: string; isPinned?: boolean }> }) {
  const { userId, userData, socials } = input

  const user = await prisma.user.upsert({
    where: { githubId: userId.toString() },
    update: {
      name: userData?.name || "",
      email: userData?.email || "",
      githubUsername: userData?.githubUsername || "",
      avatarUrl: userData?.avatarUrl || "",
      bio: userData?.bio || "",
      location: userData?.location || "",
      websiteUrl: userData?.websiteUrl || "",
      twitterUsername: userData?.twitterUsername || "",
      company: userData?.company || "",
      publicRepos: userData?.publicRepos || 0,
      followers: userData?.followers || 0,
      following: userData?.following || 0,
    },
    create: {
      githubId: userId.toString(),
      name: userData?.name || "",
      email: userData?.email || "",
      githubUsername: userData?.githubUsername || "",
      avatarUrl: userData?.avatarUrl || "",
      bio: userData?.bio || "",
      location: userData?.location || "",
      websiteUrl: userData?.websiteUrl || "",
      twitterUsername: userData?.twitterUsername || "",
      company: userData?.company || "",
      publicRepos: userData?.publicRepos || 0,
      followers: userData?.followers || 0,
      following: userData?.following || 0,
    },
  })

  const portfolio = await prisma.portfolio.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, isPublished: false },
  })

  await prisma.social.deleteMany({ where: { portfolioId: portfolio.id } })

  if (socials?.length) {
    await prisma.social.createMany({
      data: socials.map((s) => ({
        portfolioId: portfolio.id,
        platform: s.platform,
        username: s.username,
        url: s.url || generatePlatformUrl(s.platform, s.username),
        isPinned: s.isPinned || false,
      })),
    })
  }

  return portfolio
}

export function generatePlatformUrl(platform: string, username: string): string {
  const platforms: Record<string, string> = {
    github: `https://github.com/${username}`,
    twitter: `https://twitter.com/${username}`,
    linkedin: `https://linkedin.com/in/${username}`,
    instagram: `https://instagram.com/${username}`,
    facebook: `https://facebook.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    stackoverflow: `https://stackoverflow.com/users/${username}`,
    reddit: `https://reddit.com/u/${username}`,
  }
  return platforms[platform] || `https://${platform}.com/${username}`
}

export async function updateThemeByUserId(input: { userId: string; theme: string }) {
  const { userId, theme } = input
  const user = await prisma.user.findUnique({ where: { githubId: userId.toString() } })
  if (!user) return null

  await prisma.portfolio.upsert({
    where: { userId: user.id },
    update: { selectedTheme: theme as any, updatedAt: new Date() },
    create: {
      userId: user.id,
      displayName: user.name || user.githubUsername || "",
      bio: (user as any).bio || "",
      profilePic: (user as any).avatarUrl || "",
      customUsername: user.githubUsername || "",
      selectedTheme: theme as any,
      isPublished: false,
    },
  })

  return true
}

export async function getThemeByUserId(input: { userId: string }) {
  const { userId } = input
  const user = await prisma.user.findUnique({ where: { githubId: userId } })
  if (!user) return null
  const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id }, select: { id: true, selectedTheme: true, themeConfig: true } })
  return portfolio
}

export async function updateThemeByPortfolioId(input: { portfolioId: number; theme: string }) {
  const { portfolioId, theme } = input
  const updated = await prisma.portfolio.update({ where: { id: portfolioId }, data: { selectedTheme: theme as any, updatedAt: new Date() }, include: { user: true, skills: true, socials: true, repositories: { include: { repository: true } } } })
  return updated
}

export async function getThemeByPortfolioId(input: { portfolioId: number }) {
  const { portfolioId } = input
  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId }, select: { id: true, selectedTheme: true, themeConfig: true } })
  return portfolio
}

export async function findPublishedPortfolio(query: { username?: string | null; userId?: string | null }) {
  const whereClause: any = { isPublished: true }

  if (query.userId) {
    whereClause.userId = parseInt(query.userId)
  } else if (query.username) {
    whereClause.OR = [{ customUsername: query.username }, { user: { githubUsername: query.username } }]
  }

  const portfolio = await prisma.portfolio.findFirst({
    where: whereClause,
    include: {
      user: true,
      skills: true,
      socials: true,
      repositories: {
        select: {
          id: true,
          deployedUrl: true,
          customName: true,
          customDescription: true,
          isVisible: true,
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
              stargazersCount: true,
              forksCount: true,
              size: true,
              isPrivate: true,
              isFork: true,
              isImported: true,
              createdAt: true,
              updatedAt: true,
              pushedAt: true,
            },
          },
        },
      },
    },
  })

  return portfolio
}

export async function checkUsernameAvailability(input: { username: string; currentUserId?: string | null }) {
  const cleanUsername = input.username.trim().toLowerCase()
  if (cleanUsername.length < 3) return { available: false, message: "Username must be at least 3 characters long" }
  if (cleanUsername.length > 20) return { available: false, message: "Username must be less than 20 characters" }
  if (!/^[a-z0-9-_]+$/.test(cleanUsername)) {
    return { available: false, message: "Username can only contain letters, numbers, hyphens, and underscores" }
  }

  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      customUsername: { equals: cleanUsername, mode: "insensitive" },
      user: input.currentUserId
        ? {
            id: { not: parseInt(input.currentUserId) },
          }
        : undefined,
    },
    include: { user: { select: { githubUsername: true } } },
  })

  if (existingPortfolio) {
    return { available: false, message: `Username "${cleanUsername}" is already taken` }
  }

  return { available: true, message: `Username "${cleanUsername}" is available` }
}
