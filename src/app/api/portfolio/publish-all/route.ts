import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { devLog } from "@/lib/logger"
import type { Prisma } from "@prisma/client"
import { sendEmail } from "@/lib/sendEmail"
import { generatePortfolioPublishedEmail } from "@/lib/templates/welcomeEmail"
import { validateSession } from "@/lib/session-validator"
import { normalizeUserEmail, isPlaceholderEmail } from "@/lib/utils/user-utils"
import { PortfolioCache } from "@/lib/cache/portfolio-cache"

const normalizeValue = (value?: string | null) => {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

const normalizeOptionalString = (value?: string | null) => {
  const normalized = normalizeValue(value)
  return normalized.length > 0 ? normalized : null
}

const normalizeNumericMetric = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.trunc(parsed))
}

const safeDate = (value: any): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeRepoId = (value: any): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' && value.trim() !== '') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value).toString()
  if (typeof value === 'bigint') return value.toString()
  return null
}

const normalizeSkills = (skills: any[] = []) =>
  skills
    .map((skill: any) => ({
      name: normalizeValue(skill.name),
      category: normalizeValue(skill.category),
    }))
    .sort((a, b) => {
      if (a.name !== b.name) return a.name.localeCompare(b.name)
      return a.category.localeCompare(b.category)
    })

const normalizeSocials = (socials: any[] = []) =>
  socials
    .map((social: any) => ({
      platform: normalizeValue(social.platform),
      username: normalizeValue(social.username),
      url: normalizeValue(social.url),
      isPinned: Boolean(social.isPinned),
    }))
    .sort((a, b) => {
      if (a.platform !== b.platform) return a.platform.localeCompare(b.platform)
      if (a.username !== b.username) return a.username.localeCompare(b.username)
      return a.url.localeCompare(b.url)
    })

const normalizeExperiences = (experiences: any[] = []) =>
  experiences
    .map((exp: any) => ({
      companyName: normalizeValue(exp.companyName),
      companyUrl: normalizeValue(exp.companyUrl),
      faviconUrl: normalizeValue(exp.faviconUrl),
      role: normalizeValue(exp.role),
      duration: normalizeValue(exp.duration),
      description: normalizeValue(exp.description),
    }))
    .sort((a, b) => {
      const keyA = `${a.companyName}|${a.role}|${a.duration}|${a.description}|${a.companyUrl}|${a.faviconUrl}`
      const keyB = `${b.companyName}|${b.role}|${b.duration}|${b.description}|${b.companyUrl}|${b.faviconUrl}`
      return keyA.localeCompare(keyB)
    })

const arraysEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
      return false
    }
  }
  return true
}

const stringArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export async function POST(req: NextRequest) {
  try {
    devLog("🚀 Starting publish-all request...")
    
    // SECURITY FIX: Validate session FIRST before processing any data
    const sessionValidation = await validateSession(req)
    
    if (!sessionValidation.valid) {
      console.error("❌ Unauthorized: Session validation failed:", sessionValidation.error)
      return NextResponse.json(
        { error: "Unauthorized: " + sessionValidation.error },
        { status: 401 }
      )
    }
    
    const { user: authenticatedUser, userId: sessionUserId } = sessionValidation
    devLog("✅ Session validated for user:", sessionUserId)
    
    const body = await req.json()
    devLog("📦 Request body received:",   JSON.stringify(body, null, 2))
    
    const { 
      portfolioData, 
      selectedRepos, 
      skills, 
      socials,
      deployedUrls,
      customNames,
      customDescriptions,
      githubUrls,
      selectedTheme,
      repoOrder,
      repositories,
      userId: requestedUserId,
      userData,
      logoOverrides,
      experiences,
      backgroundColor,
      backgroundPattern,
        cvUrl,
        projectCategories,
        projectStatuses,
        projectRevenues,
        projectMrrs,
        projectUsers,
        projectTechnologies,
    } = body

    // SECURITY FIX: Verify that the user is modifying their own portfolio
    if (requestedUserId && requestedUserId.toString() !== sessionUserId) {
      console.error("❌ Authorization failed: User attempting to modify another user's portfolio")
      console.error("  Session User ID:", sessionUserId)
      console.error("  Requested User ID:", requestedUserId)
      return NextResponse.json(
        { error: "Unauthorized: You can only modify your own portfolio" },
        { status: 403 }
      )
    }
    
    // Use the authenticated user ID (not the one from request body)
    // TypeScript: sessionUserId is guaranteed to exist from validateSession
    const userId: string = sessionUserId!
    devLog("👤 Authenticated User ID:", userId)
    devLog("📊 Portfolio data:", portfolioData)
    devLog("📸 Logo overrides received:", logoOverrides)
    devLog("🔧 Project Technologies received:", projectTechnologies)

    // First, get existing user from database (to preserve email from auth)
    devLog("👤 Fetching user from database with GitHub ID:", userId!.toString())
    
    let existingUser = await prisma.user.findUnique({
      where: { githubId: userId!.toString() }
    })
    
    const userEmail = normalizeUserEmail({
      userId,
      existingUserEmail: existingUser?.email,
      incomingEmail: userData?.email,
    })
    
    devLog("📧 Final email to use:", userEmail)
    
    const user = await prisma.user.upsert({
      where: { githubId: userId!.toString() },
      update: {
        name: userData?.name || existingUser?.name || "",
        // DON'T overwrite email if we have a real one from auth
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
        githubId: userId!.toString(),
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

    const existingPortfolioSnapshot = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      include: {
        skills: true,
        socials: true,
        experiences: true,
        repositories: {
          include: {
            repository: true
          }
        },
      },
    })

    const existingPortfolioReposSnapshot = existingPortfolioSnapshot?.repositories || []

    const existingVisibleRepos = existingPortfolioReposSnapshot.filter((repo) => repo.isVisible)

    const existingRepoIdsOrdered = existingVisibleRepos
      .slice()
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((repo) => normalizeRepoId(repo.repository?.githubId ?? repo.repositoryId))
      .filter((id): id is string => id !== null)

    const incomingSelectedRepoIdsRaw = Array.isArray(selectedRepos) ? selectedRepos : []
    const incomingSelectedRepoIdsNormalized = incomingSelectedRepoIdsRaw
      .map(normalizeRepoId)
      .filter((id): id is string => id !== null)

    const incomingSelectedRepoIds = incomingSelectedRepoIdsNormalized.length > 0
      ? Array.from(new Set(incomingSelectedRepoIdsNormalized))
      : existingRepoIdsOrdered

    const incomingSelectedRepoIdSet = new Set(incomingSelectedRepoIds)
    const existingRepoIdSet = new Set(existingRepoIdsOrdered)

    const repoOrderRaw = Array.isArray(repoOrder) ? repoOrder : []
    const repoOrderNormalized = repoOrderRaw
      .map(normalizeRepoId)
      .filter((id): id is string => id !== null)

    const orderToUse = repoOrderNormalized.length > 0
      ? repoOrderNormalized.filter((id) => incomingSelectedRepoIdSet.has(id))
      : incomingSelectedRepoIds

    const repoIdsDiffer = !stringArraysEqual(existingRepoIdsOrdered, incomingSelectedRepoIds)
    const orderDiffers = !stringArraysEqual(existingRepoIdsOrdered, orderToUse)

    const existingRepoMap = new Map<string, (typeof existingVisibleRepos)[number]>()
    existingVisibleRepos.forEach((repo) => {
      const repoId = normalizeRepoId(repo.repository?.githubId ?? repo.repositoryId)
      if (repoId !== null) {
        existingRepoMap.set(repoId, repo)
      }
    })

    const safeDeployedUrls = deployedUrls || {}
    const safeCustomNames = customNames || {}
    const safeCustomDescriptions = customDescriptions || {}
  const safeProjectCategories = projectCategories || {}
        const safeProjectStatuses = projectStatuses || {}
        const safeProjectRevenues = projectRevenues || {}
        const safeProjectMrrs = projectMrrs || {}
        const safeProjectUsers = projectUsers || {}
        const safeProjectTechnologies = projectTechnologies || {}

    const incomingRepoPayload = Array.isArray(repositories) ? repositories : []
    const selectedRepoPayload = incomingRepoPayload.filter((repo) => {
      const repoId = normalizeRepoId(repo?.id)
      return repoId !== null && incomingSelectedRepoIdSet.has(repoId)
    })

    const deployedChanged = selectedRepoPayload.some((repo) => {
      const repoId = normalizeRepoId(repo?.id)
      if (repoId === null) return false
      const existing = existingRepoMap.get(repoId)
      const existingValue = (existing?.deployedUrl || null) ?? null
      const incomingValue = safeDeployedUrls[repoId] || null
      return existingValue !== (incomingValue || null)
    })

    const customNameChanged = selectedRepoPayload.some((repo) => {
      const repoId = normalizeRepoId(repo?.id)
      if (repoId === null) return false
      const existing = existingRepoMap.get(repoId)
      const existingValue = (existing?.customName || null) ?? null
      const incomingValue = safeCustomNames[repoId] || null
      return existingValue !== (incomingValue || null)
    })

    const customDescriptionChanged = selectedRepoPayload.some((repo) => {
      const repoId = normalizeRepoId(repo?.id)
      if (repoId === null) return false
      const existing = existingRepoMap.get(repoId)
      const existingValue = (existing?.customDescription || null) ?? null
      const incomingValue = safeCustomDescriptions[repoId] || null
      return existingValue !== (incomingValue || null)
    })

  const projectInsightsChanged = selectedRepoPayload.some((repo) => {
    const repoId = normalizeRepoId(repo?.id)
    if (repoId === null) return false
    const existing = existingRepoMap.get(repoId)
    const existingCategory = existing?.projectCategory || null
    const existingStatus = existing?.projectStatus || null
    const existingRevenue = existing?.projectRevenue ?? null
    const existingMrr = existing?.projectMrr ?? null
    const existingUsers = existing?.projectUsers ?? null

    const incomingCategory = normalizeOptionalString(safeProjectCategories[repoId])
    const incomingStatus = normalizeOptionalString(safeProjectStatuses[repoId])
    const incomingRevenue = normalizeNumericMetric(safeProjectRevenues[repoId])
    const incomingMrr = normalizeNumericMetric(safeProjectMrrs[repoId])
    const incomingUsers = normalizeNumericMetric(safeProjectUsers[repoId])

    return (
      (existingCategory || null) !== (incomingCategory || null) ||
      (existingStatus || null) !== (incomingStatus || null) ||
      (existingRevenue ?? null) !== (incomingRevenue ?? null) ||
      (existingMrr ?? null) !== (incomingMrr ?? null) ||
      (existingUsers ?? null) !== (incomingUsers ?? null)
    )
  })

    const hasLogoOverrides = logoOverrides && Object.keys(logoOverrides).length > 0

    const repoMetadataPayloadChanged = selectedRepoPayload.some((repo) => {
      const repoId = normalizeRepoId(repo?.id)
      if (repoId === null) return false
      const existing = existingRepoMap.get(repoId)
      if (!existing) return true
      const existingRepoData = existing.repository
      const logoChanged = (repo.logo || null) !== (existingRepoData?.logo || null)
      const faviconChanged = (repo.favicon || null) !== (existingRepoData?.favicon || null)
      return logoChanged || faviconChanged
    })

  const shouldProcessRepositories = repoIdsDiffer || orderDiffers || deployedChanged || customNameChanged || customDescriptionChanged || hasLogoOverrides || repoMetadataPayloadChanged || projectInsightsChanged

    // Only process repositories if selectedRepos has changed or repo data was modified
    if (shouldProcessRepositories && incomingSelectedRepoIds.length > 0 && selectedRepoPayload.length > 0) {
      devLog(`Processing ${selectedRepoPayload.length} selected repositories...`)

      const batchSize = 10
      for (let i = 0; i < selectedRepoPayload.length; i += batchSize) {
        const batch = selectedRepoPayload.slice(i, i + batchSize)

        await Promise.all(batch.map(async (repo: any) => {
          try {
            const repoIdStr = normalizeRepoId(repo?.id)
            if (!repoIdStr) {
              devLog('⚠️ Skipping repository with invalid ID payload')
              return
            }

            const githubUrl = githubUrls?.[repoIdStr] || repo.htmlUrl || repo.githubUrl || null
            const logoOverride = logoOverrides?.[repoIdStr]
            const finalLogo = logoOverride || repo.logo || null

            const repoUpdateData: any = {
              name: repo.name || repo.fullName || '',
              fullName: repo.fullName || repo.name || '',
              description: repo.description || '',
              htmlUrl: repo.htmlUrl || githubUrl || '',
              cloneUrl: repo.cloneUrl || repo.htmlUrl || githubUrl || '',
              githubUrl: githubUrl || repo.htmlUrl || '',
              language: repo.language || '',
              languages: repo.languages ? JSON.stringify(repo.languages) : null,
              stargazersCount: repo.stargazersCount || 0,
              forksCount: repo.forksCount || 0,
              size: repo.size || 0,
              isPrivate: repo.isPrivate || false,
              isFork: repo.isFork || false,
              isImported: repo.isImported || false,
              favicon: repo.favicon || null,
              logo: finalLogo,
              siteName: repo.siteName || null,
              keywords: repo.keywords || null,
              author: repo.author || null,
              updatedAt: safeDate(repo.updatedAt) || new Date(),
              pushedAt: safeDate(repo.pushedAt),
            }

            const repoCreateData: any = {
              githubId: BigInt(repoIdStr),
              userId: user.id,
              name: repo.name || repo.fullName || '',
              fullName: repo.fullName || repo.name || '',
              description: repo.description || '',
              htmlUrl: repo.htmlUrl || githubUrl || '',
              cloneUrl: repo.cloneUrl || repo.htmlUrl || githubUrl || '',
              githubUrl: githubUrl || repo.htmlUrl || '',
              language: repo.language || '',
              languages: repo.languages ? JSON.stringify(repo.languages) : null,
              stargazersCount: repo.stargazersCount || 0,
              forksCount: repo.forksCount || 0,
              size: repo.size || 0,
              isPrivate: repo.isPrivate || false,
              isFork: repo.isFork || false,
              isImported: repo.isImported || false,
              favicon: repo.favicon || null,
              logo: finalLogo,
              siteName: repo.siteName || null,
              keywords: repo.keywords || null,
              author: repo.author || null,
              createdAt: safeDate(repo.createdAt) || new Date(),
              updatedAt: safeDate(repo.updatedAt) || new Date(),
              pushedAt: safeDate(repo.pushedAt),
            }

            await prisma.repository.upsert({
              where: { githubId: BigInt(repoIdStr) },
              update: repoUpdateData,
              create: repoCreateData,
            })
          } catch (repoError) {
            console.error(`Error upserting repository ${repo?.name || repo?.fullName || 'unknown'}:`, repoError)
            // Continue with other repositories even if one fails
          }
        }))
      }

      devLog('Selected repositories processing completed')
    }

    // Check if customUsername is already taken by another user
    if (portfolioData.customUsername) {
      const existingPortfolio = await prisma.portfolio.findFirst({
        where: {
          customUsername: portfolioData.customUsername,
          userId: {
            not: user.id
          }
        }
      })

      if (existingPortfolio) {
        return NextResponse.json(
          { 
            error: `Username "${portfolioData.customUsername}" is already taken. Please choose a different username.`,
            field: "customUsername"
          },
          { status: 400 }
        )
      }
    }

    // Now do the fast portfolio operations in a transaction with extended timeout
    devLog("🔄 Starting database transaction...")
    // Increase transaction timeout to 60 seconds for large operations
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {

      // Upsert portfolio (create or update) - ALL data at once
      devLog("💾 Creating/updating portfolio...")
      const portfolioUpdateData: any = {
        displayName: portfolioData.displayName,
        jobTitle: portfolioData.jobTitle,
        bio: portfolioData.bio,
        profilePic: portfolioData.profilePic,
        customUsername: portfolioData.customUsername,
        selectedTheme: selectedTheme || 'light',
        backgroundColor: backgroundColor || null,
        backgroundPattern: backgroundPattern || null,
        cvUrl: cvUrl || null,
        isPublished: true,
        updatedAt: new Date(),
      }

      const portfolioCreateData: any = {
        userId: user.id,
        displayName: portfolioData.displayName,
        jobTitle: portfolioData.jobTitle,
        bio: portfolioData.bio,
        profilePic: portfolioData.profilePic,
        customUsername: portfolioData.customUsername,
        selectedTheme: selectedTheme || 'light',
        backgroundColor: backgroundColor || null,
        backgroundPattern: backgroundPattern || null,
        cvUrl: cvUrl || null,
        isPublished: true,
      }

      const portfolio = await tx.portfolio.upsert({
        where: { userId: user.id },
        update: portfolioUpdateData,
        create: portfolioCreateData,
      })

      const normalizedIncomingSkills = normalizeSkills(Array.isArray(skills) ? skills : [])
      const normalizedExistingSkills = normalizeSkills(existingPortfolioSnapshot?.skills || [])
      const skillsChanged = !arraysEqual(normalizedIncomingSkills, normalizedExistingSkills)

      if (skillsChanged) {
        devLog(`✏️ Updating skills (changed: ${skillsChanged})`)
      await tx.skill.deleteMany({
        where: { portfolioId: portfolio.id }
      })

        if (normalizedIncomingSkills.length > 0) {
        await tx.skill.createMany({
            data: normalizedIncomingSkills.map((skill) => ({
            name: skill.name,
              category: skill.category || null,
            portfolioId: portfolio.id,
          }))
        })
      }
      } else {
        devLog("⏭️ Skipping skills update (no changes detected)")
      }

      const normalizedIncomingSocials = normalizeSocials(Array.isArray(socials) ? socials : [])
      const normalizedExistingSocials = normalizeSocials(existingPortfolioSnapshot?.socials || [])
      const socialsChanged = !arraysEqual(normalizedIncomingSocials, normalizedExistingSocials)

      if (socialsChanged) {
        devLog("✏️ Updating socials (changes detected)")
        await tx.social.deleteMany({
          where: { portfolioId: portfolio.id }
        })

        if (normalizedIncomingSocials.length > 0) {
        await tx.social.createMany({
            data: normalizedIncomingSocials.map((social) => ({
            platform: social.platform,
            username: social.username,
            url: social.url,
            isPinned: social.isPinned,
            portfolioId: portfolio.id,
          }))
        })
        }
      } else {
        devLog("⏭️ Skipping socials update (no changes detected)")
      }

      if (Array.isArray(experiences)) {
        const normalizedIncomingExperiences = normalizeExperiences(experiences)
        const normalizedExistingExperiences = normalizeExperiences(existingPortfolioSnapshot?.experiences || [])
        const experiencesChanged = !arraysEqual(normalizedIncomingExperiences, normalizedExistingExperiences)

        if (experiencesChanged) {
          devLog("✏️ Updating experiences (changes detected)")
        await tx.experience.deleteMany({ where: { portfolioId: portfolio.id } })
          if (normalizedIncomingExperiences.length > 0) {
          await tx.experience.createMany({
              data: normalizedIncomingExperiences.map((exp) => ({
              portfolioId: portfolio.id,
              companyName: exp.companyName,
              companyUrl: exp.companyUrl || null,
              faviconUrl: exp.faviconUrl || null,
              role: exp.role || null,
              duration: exp.duration || null,
              description: exp.description || null,
            }))
          })
          }
        } else {
          devLog("⏭️ Skipping experiences update (no changes detected)")
        }
      }

      if (shouldProcessRepositories && incomingSelectedRepoIds.length > 0) {
        const repoRecords = await tx.repository.findMany({
          where: {
            githubId: {
              in: incomingSelectedRepoIds.map((id: string) => BigInt(id))
            }
          }
        })

        const repoMap = new Map<string, typeof repoRecords[number]>()
        repoRecords.forEach(repo => {
          repoMap.set(repo.githubId.toString(), repo)
        })

        devLog(`📋 Using order array with ${orderToUse.length} items:`, orderToUse)

        // Get ALL existing repos (including soft-deleted) so we can hard delete them if not selected
        const existingPortfolioRepos = await tx.portfolioRepository.findMany({
          where: { portfolioId: portfolio.id }
        })

        const existingPortfolioRepoMap = new Map<number, typeof existingPortfolioRepos[number]>()
        existingPortfolioRepos.forEach(existing => {
          existingPortfolioRepoMap.set(existing.repositoryId, existing)
        })

        devLog(`📊 Found ${existingPortfolioRepos.length} existing portfolio repos`)

        type PortfolioRepoPayload = {
          portfolioId: number
          repositoryId: number
          deployedUrl: string | null
          customName: string | null
          customDescription: string | null
          displayOrder: number
          isVisible: boolean
          projectCategory: string | null
          projectStatus: string | null
          projectRevenue: number | null
          projectMrr: number | null
          projectUsers: number | null
          technologies: string | null
        }

          const portfolioRepos = orderToUse.map((githubIdStr: string, index: number) => {
          const repo = repoMap.get(githubIdStr)
          if (!repo) {
            devLog(`⚠️ Repository with GitHub ID ${githubIdStr} not found in repoMap`)
            return null
          }

          if (!incomingSelectedRepoIds.includes(githubIdStr)) {
            devLog(`⚠️ Repository ${githubIdStr} is in order but not selected, skipping`)
            return null
          }

          const techValue = normalizeOptionalString(safeProjectTechnologies[githubIdStr])
          devLog(`📦 Project ${githubIdStr} (${repo.name}) - Technologies:`, techValue)
          
          return {
            portfolioId: portfolio.id,
            repositoryId: repo.id,
            deployedUrl: safeDeployedUrls[githubIdStr] || null,
            customName: safeCustomNames[githubIdStr] || null,
            customDescription: safeCustomDescriptions[githubIdStr] || null,
            displayOrder: index + 1,
              isVisible: true,
              projectCategory: normalizeOptionalString(safeProjectCategories[githubIdStr]),
              projectStatus: normalizeOptionalString(safeProjectStatuses[githubIdStr]),
              projectRevenue: normalizeNumericMetric(safeProjectRevenues[githubIdStr]),
              projectMrr: normalizeNumericMetric(safeProjectMrrs[githubIdStr]),
              projectUsers: normalizeNumericMetric(safeProjectUsers[githubIdStr]),
              technologies: techValue,
          }
        }).filter((repoData): repoData is PortfolioRepoPayload => Boolean(repoData))

        devLog(`✅ Prepared ${portfolioRepos.length} portfolio repos with display orders`)

        for (const repoData of portfolioRepos) {
          const existing = existingPortfolioRepoMap.get(repoData.repositoryId)

          if (existing) {
            const portfolioRepoUpdate: any = {
              deployedUrl: repoData.deployedUrl,
              customName: repoData.customName as string | null,
              customDescription: repoData.customDescription as string | null,
              displayOrder: repoData.displayOrder as number,
              isVisible: repoData.isVisible as boolean,
                projectCategory: repoData.projectCategory,
                projectStatus: repoData.projectStatus,
                projectRevenue: repoData.projectRevenue,
                projectMrr: repoData.projectMrr,
                projectUsers: repoData.projectUsers,
                technologies: repoData.technologies,
            }

            const needsUpdate =
              (existing.deployedUrl || null) !== (portfolioRepoUpdate.deployedUrl || null) ||
              (existing.customName || null) !== (portfolioRepoUpdate.customName || null) ||
              (existing.customDescription || null) !== (portfolioRepoUpdate.customDescription || null) ||
              (existing.displayOrder || null) !== (portfolioRepoUpdate.displayOrder || null) ||
                existing.isVisible !== portfolioRepoUpdate.isVisible ||
                (existing.projectCategory || null) !== (portfolioRepoUpdate.projectCategory || null) ||
                (existing.projectStatus || null) !== (portfolioRepoUpdate.projectStatus || null) ||
                (existing.projectRevenue ?? null) !== (portfolioRepoUpdate.projectRevenue ?? null) ||
                (existing.projectMrr ?? null) !== (portfolioRepoUpdate.projectMrr ?? null) ||
                (existing.projectUsers ?? null) !== (portfolioRepoUpdate.projectUsers ?? null) ||
                (existing.technologies || null) !== (portfolioRepoUpdate.technologies || null)

            if (needsUpdate) {
              devLog(`📝 Updating portfolio repo ${existing.id} with technologies:`, portfolioRepoUpdate.technologies)
              await tx.portfolioRepository.update({
                where: { id: existing.id },
                data: portfolioRepoUpdate
              })
              devLog(`✅ Updated existing portfolio repo ${existing.id}`)
            } else {
              devLog(`⏭️ Skipped update for portfolio repo ${existing.id} (no changes)`)
            }
          } else {
            devLog(`📝 Creating new portfolio repo for ${repoData.repositoryId} with technologies:`, repoData.technologies)
            await tx.portfolioRepository.create({
              data: {
                portfolioId: repoData.portfolioId,
                repositoryId: repoData.repositoryId,
                deployedUrl: repoData.deployedUrl,
                customName: repoData.customName,
                customDescription: repoData.customDescription,
                displayOrder: repoData.displayOrder,
                  isVisible: repoData.isVisible,
                  projectCategory: repoData.projectCategory,
                  projectStatus: repoData.projectStatus,
                  projectRevenue: repoData.projectRevenue,
                  projectMrr: repoData.projectMrr,
                  projectUsers: repoData.projectUsers,
                  technologies: repoData.technologies,
              }
            })
            devLog(`✅ Created new portfolio repo for repositoryId ${repoData.repositoryId}`)
          }
        }

        const selectedRepoIds = repoRecords.map((r) => r.id)
        for (const existing of existingPortfolioRepos) {
          if (!selectedRepoIds.includes(existing.repositoryId)) {
            // HARD DELETE: Remove project completely with all analytics
            const projectIdBigInt = BigInt(existing.id)
            
            // Delete all analytics data related to this project
            await Promise.all([
              // Delete ProjectClick entries
              tx.projectClick.deleteMany({
                where: {
                  portfolioId: existing.portfolioId,
                  projectId: projectIdBigInt,
                },
              }),
              
              // Delete DailyProjectViews entries
              tx.dailyProjectViews.deleteMany({
                where: {
                  portfolioId: existing.portfolioId,
                  projectId: projectIdBigInt,
                },
              }),
              
              // Delete ProjectView entries
              tx.projectView.deleteMany({
                where: {
                  portfolioId: existing.portfolioId,
                  projectId: projectIdBigInt,
                },
              }),
            ])
            
            // Delete the PortfolioRepository itself
            // This will automatically delete ProjectUpvote (Cascade) and set Shiplog.portfolioRepositoryId to null
            await tx.portfolioRepository.delete({
              where: { id: existing.id },
            })
            
            devLog(`✅ Hard deleted portfolio repo ${existing.id} with all analytics`)
          }
        }
      } else {
        devLog("⏭️ Skipping repository processing (no repo changes detected)")
      }

      return portfolio
    }, {
      maxWait: 30000, // 30 seconds - wait up to 30 seconds for transaction to start
      timeout: 60000, // 60 seconds - transaction can run for up to 60 seconds
    })

    // Invalidate cached portfolio responses so public page reflects updates immediately
    PortfolioCache.invalidate({
      githubUsername: user.githubUsername,
      customUsername: (result as any)?.customUsername ?? portfolioData?.customUsername,
      userId: user.id,
    })

    // Send email on every publish (non-blocking)
    devLog("📧 Portfolio published! Email:", userEmail, "| isPlaceholder:", isPlaceholderEmail(userEmail))
    
    if (!isPlaceholderEmail(userEmail)) {
      devLog("🎉 Sending portfolio published email to:", userEmail)
      
      const requestUrl = new URL(req.url)
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
      
      const publishedEmailHtml = generatePortfolioPublishedEmail({
        name: user.name,
        username: user.githubUsername || '',
        portfolioUrl: baseUrl,
        customUsername: result.customUsername || undefined,
      })
      
      sendEmail({
        to: userEmail,
        subject: "🎉 Your Portfolio is Live!",
        html: publishedEmailHtml,
      })
        .then((emailResult) => {
          if (emailResult.success) {
            devLog("✅ Portfolio published email sent to:", userEmail)
          } else {
            console.error("❌ Failed to send portfolio published email:", emailResult.error)
          }
        })
        .catch((error) => {
          console.error("❌ Portfolio published email error:", error)
        })
    } else {
      devLog("⚠️ Skipping email - placeholder email detected:", userEmail)
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio published successfully! All changes have been saved.",
      portfolio: result
    })

  } catch (error) {
    console.error("❌ Error publishing portfolio:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json(
      { 
        error: "Failed to publish portfolio",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    // Do not disconnect global prisma; connection is managed centrally
  }
}
