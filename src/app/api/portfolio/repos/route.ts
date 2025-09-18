import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      selectedRepos,
      deployedUrls,
      repositories,
      userId,
      userData 
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Handle empty email to avoid unique constraint issues
    const userEmail = userData?.email && userData.email.trim() 
      ? userData.email.trim() 
      : `github-${userId}@placeholder.com`

    // First, ensure user exists
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

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id }
    })

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          displayName: userData?.name || "",
          bio: userData?.bio || "",
          profilePic: userData?.avatarUrl || "",
          customUsername: userData?.githubUsername || "",
          isPublished: true,
        }
      })
    } else {
      // Update existing portfolio to be published
      portfolio = await prisma.portfolio.update({
        where: { userId: user.id },
        data: { isPublished: true }
      })
    }

    // Save repositories to database and get their IDs
    let savedRepositoryIds: { [githubId: number]: number } = {}
    
    if (repositories && repositories.length > 0) {
      try {
        const repositoryData = repositories.map((repo: any) => ({
          githubId: BigInt(repo.id),
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          htmlUrl: repo.htmlUrl,
          cloneUrl: repo.cloneUrl || repo.htmlUrl + (repo.isImported ? '' : '.git'),
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

        // Use createMany for better performance
        await prisma.repository.createMany({
          data: repositoryData,
          skipDuplicates: true
        })

        // Get the saved repository IDs
        const savedRepos = await prisma.repository.findMany({
          where: {
            githubId: {
              in: repositories.map((repo: any) => BigInt(repo.id))
            }
          },
          select: {
            id: true,
            githubId: true
          }
        })

        // Create mapping from GitHub ID to database ID
        savedRepositoryIds = savedRepos.reduce((acc, repo) => {
          acc[Number(repo.githubId)] = repo.id
          return acc
        }, {} as { [githubId: number]: number })
      } catch (repoError) {
        console.error("Error saving repositories to database:", repoError)
        // Continue with the flow even if repository saving fails
      }
    }

    // Use transaction only for portfolio repository operations
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing portfolio repositories
      await tx.portfolioRepository.deleteMany({
        where: { portfolioId: portfolio.id }
      })

      // Add selected repositories
      if (selectedRepos && selectedRepos.length > 0) {
        const portfolioRepos = []
        
        for (const githubId of selectedRepos) {
          const dbId = savedRepositoryIds[githubId]
          if (dbId) {
            portfolioRepos.push({
              portfolioId: portfolio.id,
              repositoryId: dbId,
              deployedUrl: deployedUrls[githubId] || null,
              isVisible: true,
            })
          } else {
            console.warn(`Repository with GitHub ID ${githubId} not found in database after bulk save - this shouldn't happen`)
            
            // Try to find it again - maybe there was a race condition
            const missingRepo = await tx.repository.findFirst({
              where: { githubId: BigInt(githubId), userId: user.id }
            })
            
            if (missingRepo) {
              portfolioRepos.push({
                portfolioId: portfolio.id,
                repositoryId: missingRepo.id,
                deployedUrl: deployedUrls[githubId] || null,
                isVisible: true,
              })
            } else {
              console.error(`Repository with GitHub ID ${githubId} truly not found in database`)
            }
          }
        }

        if (portfolioRepos.length > 0) {
          await tx.portfolioRepository.createMany({
            data: portfolioRepos
          })
        }
      }

      return { portfolio, selectedRepos }
    })

    return NextResponse.json({
      success: true,
      message: "Repositories saved successfully",
      data: result
    })

  } catch (error) {
    console.error("Error saving repositories:", error)
    return NextResponse.json(
      { error: "Failed to save repositories" },
      { status: 500 }
    )
  }
}