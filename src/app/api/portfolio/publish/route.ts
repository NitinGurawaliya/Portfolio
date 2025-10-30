import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { devLog } from "@/lib/logger"
import type { Prisma } from "@prisma/client"
import { sendEmail } from "@/lib/sendEmail"
import { generatePortfolioPublishedEmail } from "@/lib/templates/welcomeEmail"
import { cache, CacheKeys, CacheTTL, getCachedData, setCachedData, invalidateCache } from "@/lib/cache"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      portfolioData, 
      selectedRepos, 
      skills, 
      deployedUrls,
      userId,
      userData 
    } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // First, get existing user from database (to preserve email from auth)
    const existingUser = await prisma.user.findUnique({
      where: { githubId: userId.toString() }
    })
    
    // Determine email: prefer existing DB email (from auth), fallback to userData, then placeholder
    let userEmail: string
    if (existingUser?.email && !existingUser.email.includes('@placeholder.com')) {
      // Use existing real email from database (saved during auth)
      userEmail = existingUser.email
    } else if (userData?.email && userData.email.trim()) {
      // Use email from frontend if available
      userEmail = userData.email.trim()
    } else {
      // Fallback to placeholder
      userEmail = `github-${userId}@placeholder.com`
    }
    
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.upsert({
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

      // Upsert portfolio (create or update)
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

      // Delete existing skills and portfolio repositories
      await tx.skill.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      await tx.portfolioRepository.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      // Add new skills
      if (skills && skills.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill: any) => ({
            name: skill.name,
            category: skill.category,
            portfolioId: portfolio.id,
          }))
        })
      }

      // Add selected repositories
      if (selectedRepos && selectedRepos.length > 0) {
        // Need to map GitHub IDs to internal DB IDs
        const repoRecords = await tx.repository.findMany({
          where: {
            githubId: {
              in: selectedRepos.map((id: number) => BigInt(id))
            }
          },
          select: { id: true, githubId: true }
        })

        const githubIdToDbId = new Map<string, number>(
          repoRecords.map((r: { id: number; githubId: bigint }) => [r.githubId.toString(), r.id])
        )

        const portfolioRepos = selectedRepos
          .map((githubId: number) => ({
            portfolioId: portfolio.id,
            repositoryId: githubIdToDbId.get(String(githubId)),
            deployedUrl: deployedUrls[githubId] || null,
            isVisible: true,
          }))
          .filter((pr: { repositoryId: number | undefined }) => Boolean(pr.repositoryId)) as Array<{
            portfolioId: number
            repositoryId: number
            deployedUrl: string | null
            isVisible: boolean
          }>

        if (portfolioRepos.length > 0) {
          await tx.portfolioRepository.createMany({
            data: portfolioRepos
          })
        }
      }

      return { portfolio, user }
    })

    // Send email on every publish (non-blocking)
    if (!result.user.email.includes('@placeholder.com')) {
      
      const requestUrl = new URL(req.url)
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
      
      const publishedEmailHtml = generatePortfolioPublishedEmail({
        name: result.user.name,
        username: result.user.githubUsername || '',
        portfolioUrl: baseUrl,
        customUsername: result.portfolio.customUsername || undefined,
      })
      
      sendEmail({
        to: result.user.email,
        subject: "🎉 Your Portfolio is Live!",
        html: publishedEmailHtml,
      })
        .then((emailResult) => {
          if (emailResult.success) {
            devLog("✅ Portfolio published email sent to:", result.user.email)
          } else {
            console.error("❌ Failed to send portfolio published email:", emailResult.error)
          }
        })
        .catch((error) => {
          console.error("❌ Portfolio published email error:", error)
        })
    }

    // Invalidate cache for this portfolio
    const portfolioUsername = result.portfolio.customUsername || result.user.githubUsername
    if (portfolioUsername) {
      invalidateCache(portfolioUsername)
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio published successfully",
      portfolio: result.portfolio
    })

  } catch (error) {
    console.error("Error publishing portfolio:", error)
    return NextResponse.json(
      { error: "Failed to publish portfolio" },
      { status: 500 }
    )
  } finally {
    // Do not disconnect global prisma; connection is managed centrally
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    if (!username && !userId) {
      return NextResponse.json(
        { error: "Username or User ID is required" },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = username ? CacheKeys.portfolio(username) : CacheKeys.portfolio(`user_${userId}`)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    let whereClause: any = { isPublished: true }

    if (userId) {
      whereClause.userId = parseInt(userId)
    } else if (username) {
      // Search by custom username first, then fall back to GitHub username
      whereClause.OR = [
        { customUsername: username },
        { user: { githubUsername: username } }
      ]
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: whereClause,
      include: {
        user: true,
        skills: true,
        socials: true,
        experiences: {
          orderBy: { createdAt: 'desc' }
        },
        repositories: {
          select: {
            id: true,
            deployedUrl: true,
            customName: true,
            customDescription: true,
            displayOrder: true,
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
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    })


    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found. Please save at least one section in the dashboard first." },
        { status: 404 }
      )
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedPortfolio = JSON.parse(JSON.stringify(portfolio, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    const responseData = {
      success: true,
      portfolio: serializedPortfolio
    }

    // Cache the response
    setCachedData(cacheKey, responseData, CacheTTL.PORTFOLIO)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    )
  } finally {
    // Connection is managed by a shared Prisma client; do not disconnect here
  }
}
