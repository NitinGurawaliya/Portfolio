import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { devLog } from "@/lib/logger"
import type { Prisma } from "@prisma/client"
import { sendEmail } from "@/lib/sendEmail"
import { invalidateCache, CacheKeys } from "@/lib/cache"
import { generatePortfolioPublishedEmail } from "@/lib/templates/welcomeEmail"

const normalizeValue = (value?: string | null) => {
  if (value === null || value === undefined) return ""
  return String(value).trim()
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
      userId,
      userData,
      logoOverrides,
      experiences,
      backgroundColor,
      backgroundPattern,
      cvUrl
    } = body

    devLog("👤 User ID:", userId)
    devLog("📊 Portfolio data:", portfolioData)
    devLog("📸 Logo overrides received:", logoOverrides)

    // Validate required fields
    if (!userId) {
      console.error("❌ No user ID provided")
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // First, get existing user from database (to preserve email from auth)
    devLog("👤 Fetching user from database with GitHub ID:", userId.toString())
    
    let existingUser = await prisma.user.findUnique({
      where: { githubId: userId.toString() }
    })
    
    // Determine email: prefer existing DB email (from auth), fallback to userData, then placeholder
    let userEmail: string
    if (existingUser?.email && !existingUser.email.includes('@placeholder.com')) {
      // Use existing real email from database (saved during auth)
      userEmail = existingUser.email
      devLog("✅ Using existing real email from database:", userEmail)
    } else if (userData?.email && userData.email.trim()) {
      // Use email from frontend if available
      userEmail = userData.email.trim()
      devLog("📧 Using email from frontend:", userEmail)
    } else {
      // Fallback to placeholder
      userEmail = `github-${userId}@placeholder.com`
      devLog("⚠️ No real email found, using placeholder:", userEmail)
    }
    
    devLog("📧 Final email to use:", userEmail)
    
    const user = await prisma.user.upsert({
      where: { githubId: userId.toString() },
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

    const shouldProcessRepositories = repoIdsDiffer || orderDiffers || deployedChanged || customNameChanged || customDescriptionChanged || hasLogoOverrides || repoMetadataPayloadChanged

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
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

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

          return {
            portfolioId: portfolio.id,
            repositoryId: repo.id,
            deployedUrl: safeDeployedUrls[githubIdStr] || null,
            customName: safeCustomNames[githubIdStr] || null,
            customDescription: safeCustomDescriptions[githubIdStr] || null,
            displayOrder: index + 1,
            isVisible: true,
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
            }

            const needsUpdate =
              (existing.deployedUrl || null) !== (portfolioRepoUpdate.deployedUrl || null) ||
              (existing.customName || null) !== (portfolioRepoUpdate.customName || null) ||
              (existing.customDescription || null) !== (portfolioRepoUpdate.customDescription || null) ||
              (existing.displayOrder || null) !== (portfolioRepoUpdate.displayOrder || null) ||
              existing.isVisible !== portfolioRepoUpdate.isVisible

            if (needsUpdate) {
              await tx.portfolioRepository.update({
                where: { id: existing.id },
                data: portfolioRepoUpdate
              })
              devLog(`✅ Updated existing portfolio repo ${existing.id}`)
            } else {
              devLog(`⏭️ Skipped update for portfolio repo ${existing.id} (no changes)`)
            }
          } else {
            await tx.portfolioRepository.create({
              data: {
                portfolioId: repoData.portfolioId,
                repositoryId: repoData.repositoryId,
                deployedUrl: repoData.deployedUrl,
                customName: repoData.customName,
                customDescription: repoData.customDescription,
                displayOrder: repoData.displayOrder,
                isVisible: repoData.isVisible,
              }
            })
            devLog(`✅ Created new portfolio repo for repositoryId ${repoData.repositoryId}`)
          }
        }

        const selectedRepoIds = repoRecords.map((r) => r.id)
        for (const existing of existingPortfolioRepos) {
          if (!selectedRepoIds.includes(existing.repositoryId)) {
            if (existing.isVisible) {
              await tx.portfolioRepository.update({
                where: { id: existing.id },
                data: {
                  isVisible: false
                }
              })
              devLog(`✅ Soft deleted portfolio repo ${existing.id}`)
            } else {
              devLog(`⏭️ Skipped soft delete for repo ${existing.id} (already hidden)`)
            }
          }
        }
      } else {
        devLog("⏭️ Skipping repository processing (no repo changes detected)")
      }

      return portfolio
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    })

    // Invalidate cached portfolio responses so public page reflects updates immediately
    try {
      const usernamesToInvalidate = new Set<string>()
      const addKeysForUsername = (username?: string | null) => {
        if (!username) return
        usernamesToInvalidate.add(CacheKeys.portfolio(username))
        usernamesToInvalidate.add(CacheKeys.portfolio(`public_${username}`))
      }
      addKeysForUsername(user.githubUsername)
      addKeysForUsername(portfolioData?.customUsername)
      addKeysForUsername((result as any)?.customUsername)
      for (const key of usernamesToInvalidate) {
        invalidateCache(key)
      }
    } catch (e) {
      console.warn("Cache invalidation failed", e)
    }

    // Send email on every publish (non-blocking)
    devLog("📧 Portfolio published! Email:", userEmail, "| isPlaceholder:", userEmail.includes('@placeholder.com'))
    
    if (!userEmail.includes('@placeholder.com')) {
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
