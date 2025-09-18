import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Starting publish-all request...")
    
    const body = await req.json()
    console.log("📦 Request body received:", JSON.stringify(body, null, 2))
    
    const { 
      portfolioData, 
      selectedRepos, 
      skills, 
      socials,
      deployedUrls,
      repositories,
      userId,
      userData 
    } = body

    console.log("👤 User ID:", userId)
    console.log("📊 Portfolio data:", portfolioData)

    // Validate required fields
    if (!userId) {
      console.error("❌ No user ID provided")
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // First, ensure user exists (outside transaction for speed)
    console.log("👤 Creating/updating user with GitHub ID:", userId.toString())
    
    // Handle empty email to avoid unique constraint issues
    const userEmail = userData?.email && userData.email.trim() 
      ? userData.email.trim() 
      : `github-${userId}@placeholder.com`
    
    console.log("📧 Using email:", userEmail)
    
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

    // Only process repositories if selectedRepos has changed or new repositories were added
    if (repositories && repositories.length > 0 && selectedRepos && selectedRepos.length > 0) {
      // Get only the selected repositories to minimize processing
      const selectedRepositories = repositories.filter((repo: any) => selectedRepos.includes(repo.id))
      
      if (selectedRepositories.length > 0) {
        console.log(`Processing ${selectedRepositories.length} selected repositories...`)
        
        // Process repositories in smaller batches to avoid timeout
        const batchSize = 10
        for (let i = 0; i < selectedRepositories.length; i += batchSize) {
          const batch = selectedRepositories.slice(i, i + batchSize)
          
          await Promise.all(batch.map(async (repo: any) => {
            try {
              await prisma.repository.upsert({
                where: { githubId: BigInt(repo.id) },
                update: {
                  name: repo.name,
                  fullName: repo.fullName,
                  description: repo.description || "",
                  htmlUrl: repo.htmlUrl,
                  cloneUrl: repo.cloneUrl || repo.htmlUrl,
                  language: repo.language || "",
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
                  updatedAt: new Date(repo.updatedAt),
                  pushedAt: repo.pushedAt ? new Date(repo.pushedAt) : null,
                },
                create: {
                  githubId: BigInt(repo.id),
                  name: repo.name,
                  fullName: repo.fullName,
                  description: repo.description || "",
                  htmlUrl: repo.htmlUrl,
                  cloneUrl: repo.cloneUrl || repo.htmlUrl,
                  language: repo.language || "",
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
                  updatedAt: new Date(repo.updatedAt),
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
        console.log('Selected repositories processing completed')
      }
    }

    // Now do the fast portfolio operations in a transaction with extended timeout
    console.log("🔄 Starting database transaction...")
    const result = await prisma.$transaction(async (tx) => {

      // Upsert portfolio (create or update) - ALL data at once
      console.log("💾 Creating/updating portfolio...")
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

        const portfolioRepos = repoRecords.map((repo) => ({
          portfolioId: portfolio.id,
          repositoryId: repo.id,
          deployedUrl: deployedUrls[repo.githubId.toString()] || null,
          isVisible: true,
        }))

        await tx.portfolioRepository.createMany({
          data: portfolioRepos
        })
      }

      return portfolio
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    })

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
    await prisma.$disconnect()
  }
}
