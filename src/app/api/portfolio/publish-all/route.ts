import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { devLog } from "@/lib/logger"
import type { Prisma } from "@prisma/client"
import { sendEmail } from "@/lib/sendEmail"
import { generatePortfolioPublishedEmail } from "@/lib/templates/welcomeEmail"

export async function POST(req: NextRequest) {
  try {
    devLog("🚀 Starting publish-all request...")
    
    const body = await req.json()
    devLog("📦 Request body received:", JSON.stringify(body, null, 2))
    
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
      userData 
    } = body

    devLog("👤 User ID:", userId)
    devLog("📊 Portfolio data:", portfolioData)

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

    // Only process repositories if selectedRepos has changed or new repositories were added
    if (repositories && repositories.length > 0 && selectedRepos && selectedRepos.length > 0) {
      // Get only the selected repositories to minimize processing
      const selectedRepositories = repositories.filter((repo: any) => selectedRepos.includes(repo.id))
      
      if (selectedRepositories.length > 0) {
        devLog(`Processing ${selectedRepositories.length} selected repositories...`)
        
        // Process repositories in smaller batches to avoid timeout
        const batchSize = 10
        for (let i = 0; i < selectedRepositories.length; i += batchSize) {
          const batch = selectedRepositories.slice(i, i + batchSize)
          
          await Promise.all(batch.map(async (repo: any) => {
            try {
              // Get GitHub URL for this repo (for imported projects)
              const githubUrl = githubUrls?.[repo.id] || repo.htmlUrl
              
              await prisma.repository.upsert({
                where: { githubId: BigInt(repo.id) },
                update: {
                  name: repo.name,  // Keep original GitHub name
                  fullName: repo.fullName,
                  description: repo.description || "",  // Keep original GitHub description
                  htmlUrl: repo.htmlUrl,
                  cloneUrl: repo.cloneUrl || repo.htmlUrl,
                  githubUrl: githubUrl,
                  language: repo.language || "",
                  languages: repo.languages ? JSON.stringify(repo.languages) : null,
                  stargazersCount: repo.stargazersCount || 0,
                  forksCount: repo.forksCount || 0,
                  size: repo.size || 0,
                  isPrivate: repo.isPrivate || false,
                  isFork: repo.isFork || false,
                  isImported: repo.isImported || false,
                  favicon: repo.favicon || null,
                  siteName: repo.siteName || null,
                  keywords: repo.keywords || null,
                  author: repo.author || null,
                  createdAt: new Date(repo.createdAt),
                  updatedAt: new Date(),
                  pushedAt: repo.pushedAt ? new Date(repo.pushedAt) : null,
                },
                create: {
                  githubId: BigInt(repo.id),
                  name: repo.name,  // Keep original GitHub name
                  fullName: repo.fullName,
                  description: repo.description || "",  // Keep original GitHub description
                  htmlUrl: repo.htmlUrl,
                  cloneUrl: repo.cloneUrl || repo.htmlUrl,
                  githubUrl: githubUrl,
                  language: repo.language || "",
                  languages: repo.languages ? JSON.stringify(repo.languages) : null,
                  stargazersCount: repo.stargazersCount || 0,
                  forksCount: repo.forksCount || 0,
                  size: repo.size || 0,
                  isPrivate: repo.isPrivate || false,
                  isFork: repo.isFork || false,
                  isImported: repo.isImported || false,
                  favicon: repo.favicon || null,
                  siteName: repo.siteName || null,
                  keywords: repo.keywords || null,
                  author: repo.author || null,
                  createdAt: new Date(repo.createdAt),
                  updatedAt: new Date(),
                  pushedAt: repo.pushedAt ? new Date(repo.pushedAt) : null,
                  userId: user.id,
                },
              })
            } catch (repoError) {
              console.error(`Error upserting repository ${repo.name}:`, repoError)
              // Continue with other repositories even if one fails
            }
          }))
        }
        devLog('Selected repositories processing completed')
      }
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
      const portfolio = await tx.portfolio.upsert({
        where: { userId: user.id },
        update: {
          displayName: portfolioData.displayName,
          jobTitle: portfolioData.jobTitle,
          bio: portfolioData.bio,
          profilePic: portfolioData.profilePic,
          customUsername: portfolioData.customUsername,
          selectedTheme: selectedTheme || 'light',
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
          selectedTheme: selectedTheme || 'light',
          isPublished: true,
        },
      })

      // Delete existing skills, socials, and portfolio repositories
      await tx.skill.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      await tx.social.deleteMany({
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

      // Add new social accounts
      if (socials && socials.length > 0) {
        await tx.social.createMany({
          data: socials.map((social: any) => ({
            platform: social.platform,
            username: social.username,
            url: social.url,
            isPinned: social.isPinned,
            portfolioId: portfolio.id,
          }))
        })
      }

      // Add selected repositories
      if (selectedRepos && selectedRepos.length > 0) {
        // Get the actual repository records to map githubId to internal id
        const repoRecords = await tx.repository.findMany({
          where: {
            githubId: {
              in: selectedRepos.map((id: number) => BigInt(id))
            }
          }
        })

        // Create a map for quick lookup
        const repoMap = new Map()
        repoRecords.forEach(repo => {
          repoMap.set(repo.githubId.toString(), repo)
        })

        // Map repositories in the order specified by repoOrder (if provided) or selectedRepos
        const orderToUse = (repoOrder && repoOrder.length > 0) ? repoOrder : selectedRepos
        devLog(`📋 Using order array with ${orderToUse.length} items:`, orderToUse)
        
        const portfolioRepos = orderToUse.map((githubId: number, index: number) => {
          const repo = repoMap.get(githubId.toString())
          if (!repo) {
            devLog(`⚠️ Repository with GitHub ID ${githubId} not found in repoMap`)
            return null
          }
          
          // Only include if it's in selectedRepos
          if (!selectedRepos.includes(githubId)) {
            devLog(`⚠️ Repository ${githubId} is in order but not selected, skipping`)
            return null
          }
          
          const githubIdStr = githubId.toString()
          return {
            portfolioId: portfolio.id,
            repositoryId: repo.id,
            deployedUrl: deployedUrls[githubIdStr] || null,
            customName: customNames?.[githubIdStr] || null,
            customDescription: customDescriptions?.[githubIdStr] || null,
            displayOrder: index + 1, // Set display order based on repoOrder/selectedRepos order
            isVisible: true,
          }
        }).filter(Boolean) // Remove null entries
        
        devLog(`✅ Created ${portfolioRepos.length} portfolio repos with display orders`)

        await tx.portfolioRepository.createMany({
          data: portfolioRepos
        })
      }

      return portfolio
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    })

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
